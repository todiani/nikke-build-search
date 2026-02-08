import type { NikkeData, PartOptions } from '../data/nikkes';
import { BURST_DB, setBurstDB, getBurstDB } from '../data/burst_db';
import { TAG_DATA } from '../data/tags';
import { getNikkeBuild, setNikkeBuildsDB } from '../data/nikke_builds_db';
import {
    normalizeName,
    TIER_TO_STARS, PVP_TIERS,
    tierOptions, companyOptions, codeOptions, burstOptions, weaponOptions, classOptions, rarityOptions
} from './nikkeConstants';
import { CORPORATE_TOWER_DATA, ATTRIBUTE_TOWER_DATA } from '../data/tower_data';

// --- 분야별 티어 정보 가져오기 공통 함수 ---
export const getNikkeStarsForCategory = (nikke: NikkeData, categoryId: string, activeTab?: 'corporate' | 'attribute') => {
    const mapping: Record<string, string> = {
        'Stage': '스테이지',
        'Anomaly': '이상개체요격전',
        'SoloRaid': '솔로레이드',
        'UnionRaid': '유니온레이드',
        'PVP': 'PVP',
        'Tower': activeTab === 'corporate' ? '기업타워' : '트라이브타워'
    };
    const categoryKey = mapping[categoryId] || categoryId;

    const masters = getMasters();
    const latestTiers = masters.latest_tiers || {};
    const categoryTiers = latestTiers[categoryKey] || {};

    // 이름 매칭 (정확히 일치하거나 normalize해서 일치하는지 확인)
    if (categoryTiers[nikke.name] !== undefined) return categoryTiers[nikke.name];

    const searchName = normalize(nikke.name);
    for (const [name, stars] of Object.entries(categoryTiers)) {
        if (normalize(name) === searchName) return (stars as number);
    }

    return 0;
};

export const starsToTierString = (stars: number) => {
    if (stars === 5) return 'SSS';
    if (stars === 4) return 'SS';
    if (stars === 3) return 'S';
    if (stars === 2) return 'A';
    if (stars === 1) return 'B';
    return 'B';
};

// --- String Normalization ---
export const normalize = normalizeName;

/**
 * Ensures a Nikke has all the standard fields for the app.
 * Fills in default Usage Stats and Burst Details if they are missing.
 */
export type MetaCategory = 'Stage' | 'Anomaly' | 'SoloRaid' | 'UnionRaid' | 'PVP' | 'Tower';

export interface MetaTeam {
    boss: string;
    type: 'PVE' | 'PVP' | 'SoloRaid';
    category?: MetaCategory;
    description?: string;
    members: (string | { id: string; name: string; isGuest?: boolean })[]; // 니케 이름 또는 객체 배열 (5인)
    substitutes?: { target: string; replace: string; note?: string }[];
    core_units?: string[];
}

// --- 최신 분야별 티어 데이터 (DB에서 로드됨) ---
let LATEST_TIERS: Record<string, Record<string, number>> = {};

export const initializeNikkeData = (nikke: NikkeData): NikkeData => {
    if (!nikke || typeof nikke !== 'object') {
        console.warn("[Data] Attempted to initialize invalid nikke object:", nikke);
        throw new Error(`[Data] Invalid nikke data: Missing required fields or invalid object.`);
    }
    const updated = { ...nikke };

    // Ensure basic string fields exist and are strings
    if (!updated.name || updated.name === 'Unknown' || updated.name === '확인 필요') {
        throw new Error(`[Data] Nikke name is missing or invalid: ${updated.id}`);
    }
    updated.name = String(updated.name);
    updated.name_en = String(updated.name_en || '');
    updated.tier = String(updated.tier || 'Unranked');
    updated.burst = String(updated.burst || 'I');
    updated.class = String(updated.class || '화력형');
    updated.weapon = String(updated.weapon || '소총 (AR)');
    updated.squad = String(updated.squad || '-');
    updated.company = String(updated.company || '엘리시온');
    updated.code = String(updated.code || '작열');
    updated.id = String(updated.id || ('temp-' + updated.name));

    const masters = getMasters();

    // Use DB values if available, otherwise fallback to constants
    const tierToStars = (masters.tier_to_stars && Object.keys(masters.tier_to_stars).length > 0)
        ? masters.tier_to_stars
        : TIER_TO_STARS;

    const pvpRankings = (masters.pvp_rankings && Object.keys(masters.pvp_rankings).length > 0)
        ? masters.pvp_rankings
        : PVP_TIERS;

    const latestTiers = (masters.latest_tiers && Object.keys(masters.latest_tiers).length > 0)
        ? masters.latest_tiers
        : LATEST_TIERS;

    // 1. Initialize Usage Stats if missing or incomplete
    if (!updated.usage_stats || updated.usage_stats.length === 0) {
        const pvpTier = pvpRankings[updated.name] || (updated.tier === 'PvP' ? 'SS' : 'B');
        updated.usage_stats = [
            { name: '스테이지', stars: tierToStars[updated.tier] ?? 3, desc: '일반 캠페인 및 타워' },
            { name: '이상개체요격전', stars: Math.max(0, (tierToStars[updated.tier] ?? 3) - 1), desc: '특수 개체 보스 공략' },
            { name: '솔로레이드', stars: tierToStars[updated.tier] ?? 3, desc: updated.code ? `${updated.code}코드 보스 특화` : '고득점 핵심 유닛' },
            { name: '유니온레이드', stars: Math.max(0, (tierToStars[updated.tier] ?? 2) - 1), desc: updated.code ? `${updated.code}코드 보스` : '길드 레이드 활용' },
            { name: '기업타워', stars: tierToStars[updated.tier] ?? 3, desc: '적극 활용 가능' },
            { name: '트라이브타워', stars: tierToStars[updated.tier] ?? 3, desc: '적극 활용 가능' },
            { name: 'PVP', stars: tierToStars[pvpTier] ?? 1, desc: pvpTier === 'SSS' ? '아레나 필수 공무원' : '아레나 활용 가능' }
        ];
    }

    //분야별 최신 티어 정보 업데이트
    const categories = Object.keys(latestTiers);

    // Add missing categories to usage_stats
    categories.forEach(cat => {
        if (!updated.usage_stats?.find(s => s.name === cat)) {
            updated.usage_stats?.push({
                name: cat,
                stars: 0,
                desc: ""
            });
        }
    });

    // Update stars based on latestTiers
    updated.usage_stats = updated.usage_stats?.map(stat => {
        const latestCategory = latestTiers[stat.name];
        if (latestCategory && latestCategory[updated.name] !== undefined) {
            return { ...stat, stars: latestCategory[updated.name] };
        }
        return stat;
    });

    // pvpRankings를 활용한 추가 보정 (PVP 별점)
    const pvpTierValue = pvpRankings[updated.name];
    if (pvpTierValue) {
        const pvpStat = updated.usage_stats?.find(s => s.name === 'PVP');
        if (pvpStat) {
            pvpStat.stars = tierToStars[pvpTierValue] || pvpStat.stars;
        }
    }

    // 2. Initialize Burst Details if missing
    if (!updated.burst_details || Object.keys(updated.burst_details).length === 0) {
        // ... (Keep existing logic)
        const cleanName = updated.name.split('(')[0].trim();
        const burstData = BURST_DB[cleanName] || BURST_DB[updated.name];
        if (burstData) {
            updated.burst_details = burstData;
        } else {
            const stages: ("2RL" | "2_5RL" | "3RL" | "3_5RL" | "4RL")[] = ["2RL", "2_5RL", "3RL", "3_5RL", "4RL"];
            updated.burst_details = {};
            stages.forEach(s => {
                updated.burst_details![s] = { value: 0, hits: "-", bonus: "0%-0%" };
            });
        }
    }

    // 3. Initialize Build Data from NIKKE_BUILDS_DB
    if (!updated.build) {
        const buildData = getNikkeBuild(updated.name);
        if (buildData) {
            updated.build = buildData;
        } else {
            // Default empty build
            const emptyPart = (): PartOptions => ({
                option1: { type: "옵션없음", stage: 0 },
                option2: { type: "옵션없음", stage: 0 },
                option3: { type: "옵션없음", stage: 0 }
            });
            updated.build = {
                stats: { hp: 0, atk: 0, def: 0 },
                skills: { skill1: 1, skill2: 1, burst: 1 },
                cube_level: 1,
                collection: { grade: "None", skill1: 1, skill2: 1 },
                overload: {
                    helmet: emptyPart(),
                    armor: emptyPart(),
                    gloves: emptyPart(),
                    boots: emptyPart()
                }
            };
        }
    }

    // 4. Initialize Weapon Info and Normal Attack Detail if missing
    if (!updated.weapon_info) {
        updated.weapon_info = {
            weapon_name: "",
            max_ammo: 0,
            reload_time: 0,
            control_type: ""
        };
    }
    if (!updated.skills_detail) {
        updated.skills_detail = {
            normal: { name: "일반 공격", desc: "", tags: [] },
            skill1: { name: "", desc: "", tags: [] },
            skill2: { name: "", desc: "", tags: [] },
            burst: { name: "", desc: "", tags: [] }
        };
    } else if (!updated.skills_detail.normal) {
        updated.skills_detail.normal = { name: "일반 공격", desc: "", tags: [] };
    }

    return updated;
};

// --- API BASED PERSISTENCE ---

let cachedSquads: string[] = [];
let cachedNikkes: NikkeData[] = [];
let cachedMetaTeams: any[] = [];
let cachedTowerSquads: Record<string, string[][]> = {};
let cachedSavedTeams: any[] = [];
let cachedBackupSettings: any = null;
let cachedBackupHistory: any[] = [];
let cachedTags: typeof TAG_DATA = TAG_DATA;
let tagIndex: Map<string, Set<string>> = new Map(); // Nikke ID -> Set of Tag Strings

/**
 * Builds an optimized tag index for fast searching.
 * This pre-calculates which Nikkes have which tags.
 */
export const buildTagIndex = (nikkes: NikkeData[], tags: typeof TAG_DATA) => {
    const newIndex = new Map<string, Set<string>>();

    // Collect all valid tags from the configuration
    const validTags = new Set<string>();
    Object.values(tags.tag_groups).forEach(group => {
        group.tags.forEach(t => validTags.add(t));
    });

    nikkes.forEach(nikke => {
        const nikkeTags = new Set<string>();

        // 1. Collect explicitly defined tags in skills_detail
        if (nikke.skills_detail) {
            (['skill1', 'skill2', 'burst'] as const).forEach(s => {
                const skill = nikke.skills_detail?.[s];
                if (skill?.tags) {
                    skill.tags.forEach(t => nikkeTags.add(t));
                }
            });
        }

        // 2. Perform text-based indexing for tags that might not be explicitly tagged
        // but exist in the configuration. This ensures the index is comprehensive.
        const searchFields = [
            nikke.name,
            nikke.name_en || '',
            nikke.desc || '',
            nikke.skills_detail?.skill1?.name || '',
            nikke.skills_detail?.skill1?.desc || '',
            nikke.skills_detail?.skill2?.name || '',
            nikke.skills_detail?.skill2?.desc || '',
            nikke.skills_detail?.burst?.name || '',
            nikke.skills_detail?.burst?.desc || ''
        ].join(' ').toLowerCase();

        validTags.forEach(tag => {
            if (nikkeTags.has(tag)) return;
            const cleanTag = tag.replace(/[▲▼]/g, '').toLowerCase();
            if (searchFields.includes(cleanTag)) {
                nikkeTags.add(tag);
            }
        });

        newIndex.set(nikke.id, nikkeTags);
    });

    tagIndex = newIndex;
    console.log(`[Performance] Tag index built for ${nikkes.length} nikkes`);
};

/**
 * Fast tag search using the pre-built index.
 */
export const searchNikkesByTags = (
    allNikkes: NikkeData[],
    selectedTags: { and: string[]; or: string[]; not: string[] }
): NikkeData[] => {
    const { and, or, not } = selectedTags;

    if (and.length === 0 && or.length === 0 && not.length === 0) {
        return [];
    }

    return allNikkes.filter(nikke => {
        const nikkeTags = tagIndex.get(nikke.id);
        if (!nikkeTags) return false;

        // NOT check (Highest priority to fail fast)
        for (const tag of not) {
            if (nikkeTags.has(tag)) return false;
        }

        // AND check
        for (const tag of and) {
            if (!nikkeTags.has(tag)) return false;
        }

        // OR check
        if (or.length > 0) {
            let hit = false;
            for (const tag of or) {
                if (nikkeTags.has(tag)) {
                    hit = true;
                    break;
                }
            }
            if (!hit) return false;
        }

        return true;
    });
};

type MasterKey = 'tiers' | 'companies' | 'codes' | 'bursts' | 'weapons' | 'classes' | 'rarities' | 'squads';

export interface MasterData {
    tiers: string[];
    companies: string[];
    codes: string[];
    bursts: string[];
    weapons: string[];
    classes: string[];
    rarities: string[];
    squads: string[];
    weapon_names?: Record<string, string>;
    class_names?: Record<string, string>;
    class_descriptions?: Record<string, string>;
    tier_to_stars?: Record<string, number>;
    usage_categories?: string[];
    pvp_rankings?: Record<string, string>;
    latest_tiers?: Record<string, Record<string, number>>;
    colors?: {
        code_text: Record<string, string>;
        burst: Record<string, string>;
        class: Record<string, string>;
        company: Record<string, string>;
        weapon: Record<string, string>;
        code: Record<string, string>;
        tier: Record<string, string>;
        rarity: Record<string, string>;
    };
    corporate_tower_data?: any[];
    attribute_tower_data?: any[];
    default_tower_squads?: Record<string, string[][]>;
    overload_data?: Record<string, any>;
    overload_type_map?: Record<string, any>;
    weapon_option_defaults?: Record<string, any>;
    preset_build_data?: Record<string, any>;
    all_nikkes?: NikkeData[];
}

let cachedMasters: MasterData = {
    tiers: [],
    companies: [],
    codes: [],
    bursts: [],
    weapons: [],
    classes: [],
    rarities: [],
    squads: [],
    weapon_names: {},
    class_names: {},
    class_descriptions: {},
    tier_to_stars: {},
    usage_categories: [],
    pvp_rankings: {},
    latest_tiers: LATEST_TIERS, // Initialize with default 2026 meta tiers
    colors: {
        code_text: {},
        burst: {},
        class: {},
        company: {},
        weapon: {},
        code: {},
        tier: {},
        rarity: {}
    },
    corporate_tower_data: CORPORATE_TOWER_DATA,
    attribute_tower_data: ATTRIBUTE_TOWER_DATA,
    default_tower_squads: {},
    overload_data: {},
    overload_type_map: {},
    weapon_option_defaults: {},
    preset_build_data: {},
    all_nikkes: []
};

const uniq = (arr: (string | undefined | null)[]) =>
    Array.from(new Set(arr.map(v => (v ?? '').trim()).filter(Boolean)));

const sortWithPreferredOrder = (values: string[], preferredOrder: string[]) => {
    const preferred = new Map(preferredOrder.map((v, i) => [v, i] as const));
    return [...values].sort((a, b) => {
        const ai = preferred.has(a) ? (preferred.get(a) as number) : Number.MAX_SAFE_INTEGER;
        const bi = preferred.has(b) ? (preferred.get(b) as number) : Number.MAX_SAFE_INTEGER;
        if (ai !== bi) return ai - bi;

        // Safety check for localeCompare
        const strA = String(a || '');
        const strB = String(b || '');
        return strA.localeCompare(strB, 'ko');
    });
};

const buildMastersFromData = (nikkes: NikkeData[], squads: string[]): MasterData => {
    const tiers = sortWithPreferredOrder(
        uniq(nikkes.map(n => n.tier)),
        tierOptions
    );
    const companies = sortWithPreferredOrder(
        uniq(nikkes.map(n => n.company)),
        companyOptions
    );
    const codes = sortWithPreferredOrder(
        uniq(nikkes.map(n => n.code)),
        codeOptions
    );
    const bursts = sortWithPreferredOrder(
        uniq(nikkes.map(n => n.burst)),
        burstOptions
    );
    const weapons = sortWithPreferredOrder(
        uniq(nikkes.map(n => n.weapon)),
        weaponOptions
    );
    const classes = sortWithPreferredOrder(
        uniq(nikkes.map(n => n.class)),
        classOptions
    );
    const rarities = sortWithPreferredOrder(
        uniq(nikkes.map(n => n.rarity)),
        rarityOptions
    );
    const mergedSquads = sortWithPreferredOrder(
        uniq([...(squads || []), ...nikkes.map(n => n.squad)]),
        []
    );

    return {
        tiers,
        companies,
        codes,
        bursts,
        weapons,
        classes,
        rarities,
        squads: mergedSquads,
        latest_tiers: LATEST_TIERS // Default fallback
    };
};

const syncMastersFromCachedNikkes = () => {
    const rebuilt = buildMastersFromData(cachedNikkes, cachedSquads);
    cachedMasters = {
        ...cachedMasters,
        tiers: sortWithPreferredOrder(uniq([...(cachedMasters.tiers || []), ...(rebuilt.tiers || [])]), tierOptions),
        companies: sortWithPreferredOrder(uniq([...(cachedMasters.companies || []), ...(rebuilt.companies || [])]), companyOptions),
        codes: sortWithPreferredOrder(uniq([...(cachedMasters.codes || []), ...(rebuilt.codes || [])]), codeOptions),
        bursts: sortWithPreferredOrder(uniq([...(cachedMasters.bursts || []), ...(rebuilt.bursts || [])]), burstOptions),
        weapons: sortWithPreferredOrder(uniq([...(cachedMasters.weapons || []), ...(rebuilt.weapons || [])]), weaponOptions),
        classes: sortWithPreferredOrder(uniq([...(cachedMasters.classes || []), ...(rebuilt.classes || [])]), classOptions),
        rarities: sortWithPreferredOrder(uniq([...(cachedMasters.rarities || []), ...(rebuilt.rarities || [])]), rarityOptions),
        squads: sortWithPreferredOrder(uniq([...(cachedMasters.squads || []), ...(rebuilt.squads || [])]), []),
        // Preserve the static mappings loaded from JSON
        weapon_names: cachedMasters.weapon_names || {},
        class_names: cachedMasters.class_names || {},
        class_descriptions: cachedMasters.class_descriptions || {},
        tier_to_stars: cachedMasters.tier_to_stars || {},
        usage_categories: cachedMasters.usage_categories || [],
        pvp_rankings: cachedMasters.pvp_rankings || {},
        latest_tiers: cachedMasters.latest_tiers || {},
        colors: cachedMasters.colors || {
            code_text: {},
            burst: {},
            class: {},
            company: {},
            weapon: {},
            code: {},
            tier: {},
            rarity: {}
        },
        corporate_tower_data: cachedMasters.corporate_tower_data,
        attribute_tower_data: cachedMasters.attribute_tower_data,
        default_tower_squads: cachedMasters.default_tower_squads,
        overload_data: cachedMasters.overload_data,
        overload_type_map: cachedMasters.overload_type_map,
        weapon_option_defaults: cachedMasters.weapon_option_defaults,
        preset_build_data: cachedMasters.preset_build_data
    };
    cachedSquads = cachedMasters.squads;
};

export const getMasters = () => {
    return {
        ...cachedMasters,
        all_nikkes: cachedNikkes
    };
};

let isDBLoaded = false;

// Load all data from server
export const loadDB = async (forceReload = false) => {
    // Return cached data if already loaded to avoid race conditions and redundant fetches
    if (!forceReload && isDBLoaded && cachedNikkes.length > 0) {
        const burstData = getBurstDB();
        return {
            squads: cachedSquads,
            nikkes: cachedNikkes,
            meta_teams: cachedMetaTeams,
            tower_squads: cachedTowerSquads,
            saved_teams: cachedSavedTeams,
            backup_settings: cachedBackupSettings,
            backup_history: cachedBackupHistory,
            tags: cachedTags,
            burst_db: burstData
        };
    }

    try {
        // Load main DB, builds, and burst data in parallel
        const [dbRes, buildsRes, burstRes] = await Promise.all([
            fetch('http://localhost:3001/api/db'),
            fetch('http://localhost:3001/api/nikke-builds'),
            fetch('http://localhost:3001/api/burst-db')
        ]);

        if (dbRes.ok) {
            const json = await dbRes.json();

            // Update Builds DB if loaded
            if (buildsRes.ok) {
                const buildsData = await buildsRes.json();
                setNikkeBuildsDB(buildsData);
            }

            // Update Burst DB if loaded
            let burstData = null;
            if (burstRes.ok) {
                burstData = await burstRes.json();
                setBurstDB(burstData);
            }

            cachedSquads = (json.masters && json.masters.squads) || json.squads || [];

            // Populate masters first so initializeNikkeData can use them
            // Ensure latest_tiers is merged with default LATEST_TIERS if missing or incomplete
            const loadedMasters = json.masters || {};
            cachedMasters = {
                ...buildMastersFromData([], cachedSquads), // Base with all required fields
                ...loadedMasters, // Overwrite with loaded data
                squads: cachedSquads, // Ensure squads is synced
                latest_tiers: {
                    ...LATEST_TIERS, // Default 2026 tiers
                    ...(loadedMasters.latest_tiers || {}) // Merge with loaded tiers
                }
            };

            cachedNikkes = (json.nikkes || []).map(initializeNikkeData);
            cachedMetaTeams = json.meta_teams || [];
            cachedTowerSquads = json.tower_squads || {};
            cachedSavedTeams = json.saved_teams || [];
            cachedBackupSettings = json.backup_settings || null;
            cachedBackupHistory = json.backup_history || [];
            cachedTags = json.tags || TAG_DATA;
            buildTagIndex(cachedNikkes, cachedTags);

            // Sync again after loading nikkes to ensure all dynamic masters are updated
            syncMastersFromCachedNikkes();

            isDBLoaded = true;

            return {
                squads: cachedSquads,
                nikkes: cachedNikkes,
                meta_teams: cachedMetaTeams,
                tower_squads: cachedTowerSquads,
                saved_teams: cachedSavedTeams,
                backup_settings: cachedBackupSettings,
                backup_history: cachedBackupHistory,
                tags: cachedTags,
                burst_db: burstData
            };
        }
    } catch (e) {
        console.error("Failed to load DB", e);
        return null; // Return null on failure
    }
};

// Debounce timer
let saveTimer: any = null;

// Save helper
const saveDB = async () => {
    // Clear existing timer
    if (saveTimer) clearTimeout(saveTimer);

    // Use debounce to prevent rapid sequential saves (e.g., during bulk edits)
    return new Promise<void>((resolve) => {
        saveTimer = setTimeout(async () => {
            try {
                // --- SAFETY CHECK ---
                if (!isDBLoaded) {
                    console.warn("[Safety] Attempted to save DB before it was loaded. Aborting.");
                    resolve();
                    return;
                }

                if (cachedNikkes.length === 0) {
                    console.warn("[Safety] Attempted to save DB with 0 nikkes. Aborting.");
                    resolve();
                    return;
                }

                // 1. Separate Build and Burst Data from Nikke Data
                const builds: Record<string, any> = {};
                const bursts: Record<string, any> = {};

                const nikkesWithoutBuild = cachedNikkes.map(n => {
                    const { build, burst_details, ...rest } = n;
                    const cleanName = n.name.split('(')[0].trim();

                    if (build) builds[cleanName] = build;
                    if (burst_details) bursts[cleanName] = burst_details;

                    return rest;
                });

                // 2. Prepare Main DB payload
                const payload = {
                    meta: { version: "1.1", last_updated: new Date().toISOString() },
                    masters: {
                        ...cachedMasters,
                        squads: cachedSquads // Ensure latest squads are saved in masters
                    },
                    nikkes: nikkesWithoutBuild,
                    meta_teams: cachedMetaTeams,
                    tower_squads: cachedTowerSquads,
                    saved_teams: cachedSavedTeams,
                    backup_settings: cachedBackupSettings,
                    backup_history: cachedBackupHistory,
                    tags: cachedTags
                };

                // 3. Save all in ONE request (Consolidated & Atomic)
                const response = await fetch('http://localhost:3001/api/save-all', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        db: payload,
                        builds: builds,
                        bursts: bursts
                    })
                });

                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }

                console.log("DB, Builds, and Bursts Saved Successfully (Atomic)");
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('nikke-db-updated'));
                }
            } catch (e) {
                console.error("Failed to save DB atomically", e);
            } finally {
                resolve();
            }
        }, 300); // 300ms debounce
    });
};

export const saveMetaTeams = async (teams: any[]) => {
    cachedMetaTeams = teams;
    await saveDB();
};

export const saveTags = async (tags: typeof TAG_DATA) => {
    cachedTags = tags;
    buildTagIndex(cachedNikkes, cachedTags);
    await saveDB();
};

export const saveTowerSquads = async (squads: Record<string, string[][]>) => {
    cachedTowerSquads = squads;
    await saveDB();
};

export const saveSavedTeams = async (teams: any[]) => {
    cachedSavedTeams = teams;
    await saveDB();
};

export const saveBackupSettingsToDB = async (settings: any) => {
    cachedBackupSettings = settings;
    await saveDB();
};

export const saveBackupHistoryToDB = async (history: any[]) => {
    cachedBackupHistory = history;
    await saveDB();
};

export const getBackupData = () => ({
    settings: cachedBackupSettings,
    history: cachedBackupHistory
});

export const getMasterData = (): MasterData => cachedMasters;

export const getMasterOptions = (key: MasterKey): string[] => {
    if (key === 'squads') return cachedSquads;
    return cachedMasters[key] || [];
};

export const getUsedMasterOptions = (key: MasterKey): string[] => {
    let used: string[] = [];

    if (key === 'squads') used = uniq(cachedNikkes.map(n => n.squad));
    if (key === 'tiers') used = uniq(cachedNikkes.map(n => n.tier));
    if (key === 'companies') used = uniq(cachedNikkes.map(n => n.company));
    if (key === 'codes') used = uniq(cachedNikkes.map(n => n.code));
    if (key === 'bursts') used = uniq(cachedNikkes.map(n => n.burst));
    if (key === 'weapons') used = uniq(cachedNikkes.map(n => n.weapon));
    if (key === 'classes') used = uniq(cachedNikkes.map(n => n.class));
    if (key === 'rarities') used = uniq(cachedNikkes.map(n => n.rarity));

    const usedSet = new Set(used);
    const masters = getMasterOptions(key);
    const filtered = masters.filter(v => usedSet.has(v));
    return filtered.length > 0 ? filtered : used;
};

export const getTierOptions = () => getMasterOptions('tiers');
export const getCompanyOptions = () => getMasterOptions('companies');
export const getCodeOptions = () => getMasterOptions('codes');
export const getBurstOptions = () => getMasterOptions('bursts');
export const getWeaponOptions = () => getMasterOptions('weapons');
export const getClassOptions = () => getMasterOptions('classes');
export const getRarityOptions = () => getMasterOptions('rarities');

export const getWeaponNameMap = () => cachedMasters.weapon_names || {};
export const getClassNameMap = () => cachedMasters.class_names || {};
export const getClassDescriptionMap = () => cachedMasters.class_descriptions || {};
export const getColorMap = () => cachedMasters.colors || {
    code_text: {},
    burst: {},
    class: {},
    company: {},
    weapon: {},
    code: {},
    tier: {},
    rarity: {}
};

// --- Squad Management ---

export const getSquadOptions = (): string[] => {
    return cachedSquads;
};

// NOTE: Creating specific 'cache setter' to be used by App.tsx if needed
export const setCachedData = (squads: string[], nikkes: NikkeData[]) => {
    cachedSquads = squads;
    cachedNikkes = nikkes;
    // Don't overwrite cachedMasters entirely to preserve latest_tiers etc.
    syncMastersFromCachedNikkes();
}

export const addSquad = async (name: string): Promise<string[]> => {
    if (!cachedSquads.includes(name)) {
        cachedSquads = [...cachedSquads, name];
        cachedMasters = { ...cachedMasters, squads: cachedSquads };
        await saveDB();
    }
    return cachedSquads;
};

export const updateSquad = async (oldName: string, newName: string): Promise<string[]> => {
    const idx = cachedSquads.indexOf(oldName);
    if (idx !== -1 && !cachedSquads.includes(newName)) {
        cachedSquads = [...cachedSquads];
        cachedSquads[idx] = newName;
        cachedNikkes = cachedNikkes.map(n => (n.squad === oldName ? { ...n, squad: newName } : n));
        cachedMasters = { ...cachedMasters, squads: cachedSquads };
        await saveDB();
    }
    return cachedSquads;
};

export const deleteSquad = async (name: string): Promise<string[]> => {
    cachedSquads = cachedSquads.filter(s => s !== name);
    cachedNikkes = cachedNikkes.map(n => (n.squad === name ? { ...n, squad: '' } : n));
    cachedMasters = { ...cachedMasters, squads: cachedSquads };
    await saveDB();
    return cachedSquads;
};

const masterToNikkeField: Partial<Record<Exclude<MasterKey, 'squads'>, keyof NikkeData>> = {
    tiers: 'tier',
    companies: 'company',
    codes: 'code',
    bursts: 'burst',
    weapons: 'weapon',
    classes: 'class',
    rarities: 'rarity',
};

const defaultValueForField = (field: keyof NikkeData): any => {
    if (field === 'tier') return 'Unranked';
    if (field === 'burst') return 'III';
    if (field === 'class') return 'Attacker';
    if (field === 'weapon') return 'AR';
    if (field === 'rarity') return undefined;
    return '';
};

export const addMasterValue = async (key: Exclude<MasterKey, 'squads'>, value: string) => {
    const v = value.trim();
    if (!v) return cachedMasters[key];
    const current = cachedMasters[key] || [];
    if (!current.includes(v)) {
        cachedMasters = { ...cachedMasters, [key]: [...current, v] } as MasterData;
        await saveDB();
    }
    return cachedMasters[key];
};

export const renameMasterValue = async (key: Exclude<MasterKey, 'squads'>, oldValue: string, newValue: string) => {
    const from = oldValue.trim();
    const to = newValue.trim();
    if (!from || !to || from === to) return cachedMasters[key];
    const current = cachedMasters[key] || [];
    if (!current.includes(from) || current.includes(to)) return cachedMasters[key];

    cachedMasters = {
        ...cachedMasters,
        [key]: current.map(v => (v === from ? to : v))
    } as MasterData;

    const nikkeField = masterToNikkeField[key];
    if (nikkeField) {
        cachedNikkes = cachedNikkes.map(n => ((n as any)[nikkeField] === from ? { ...n, [nikkeField]: to } : n));
    }

    await saveDB();
    return cachedMasters[key];
};

export const deleteMasterValue = async (key: Exclude<MasterKey, 'squads'>, value: string) => {
    const v = value.trim();
    if (!v) return cachedMasters[key];
    const current = cachedMasters[key] || [];
    if (!current.includes(v)) return cachedMasters[key];

    cachedMasters = {
        ...cachedMasters,
        [key]: current.filter(x => x !== v)
    } as MasterData;

    const nikkeField = masterToNikkeField[key];
    if (nikkeField) {
        const fallback = defaultValueForField(nikkeField);
        cachedNikkes = cachedNikkes.map(n => ((n as any)[nikkeField] === v ? { ...n, [nikkeField]: fallback } : n));
    }

    await saveDB();
    return cachedMasters[key];
};

// --- Nikke Management (for direct calls if needed) ---
export const saveNikkes = async (nikkes: NikkeData[]) => {
    cachedNikkes = nikkes;
    syncMastersFromCachedNikkes();
    buildTagIndex(cachedNikkes, cachedTags);
    await saveDB();
}

export const saveNikkeData = async (nikke: NikkeData) => {
    const idx = cachedNikkes.findIndex(n => n.id === nikke.id);
    if (idx !== -1) {
        cachedNikkes[idx] = nikke;
    } else {
        cachedNikkes.push(nikke);
    }

    try {
        // Save to individual Nikke API
        const response = await fetch(`http://localhost:3001/api/nikke/${nikke.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nikke)
        });

        if (!response.ok) {
            throw new Error(`Failed to save individual Nikke: ${response.statusText}`);
        }

        // Build tag index after update
        buildTagIndex(cachedNikkes, cachedTags);

        // Notify other components
        window.dispatchEvent(new CustomEvent('nikke-db-updated'));

        return await response.json();
    } catch (e) {
        console.error("Failed to save individual Nikke", e);
        // Fallback to bulk save if individual fails? 
        // Or just let it fail so user knows.
        await saveDB();
    }
};

export const deleteNikkeData = async (id: string) => {
    cachedNikkes = cachedNikkes.filter(n => n.id !== id);
    await saveDB();
};

/**
 * 니케 이름에 따른 나무위키 URL을 생성합니다.
 */
export function getNamuwikiUrl(name: string): string {
    if (!name) return "";

    // 예외 케이스 처리
    if (name === 'N102') return 'https://namu.wiki/w/N102';

    // 콜라보 캐릭터 (어브노멀)
    const abnormalCollabs = ['2B', 'A2', '파스칼', '마키마', '파워', '히메노', '에밀리아', '렘', '람', '아스카', '레이', '마리', '미사토', '이브', '릴리', '레이븐'];
    if (abnormalCollabs.includes(name)) {
        return `https://namu.wiki/w/${encodeURIComponent(name + '(승리의 여신: 니케)')}`;
    }

    // 일반적인 경우: '이름(승리의 여신: 니케)' 형식이 아닌 '이름' 자체로 문서가 존재하는 경우들
    const noSuffixNames = [
        '라피 : 레드 후드', '홍련 : 흑영', '모더니아', '니힐리스타', '레드 후드', '스노우 화이트',
        '홍련', '라푼젤', '도로시', '해란', '이사벨', '노아'
    ];

    if (noSuffixNames.some(n => name.includes(n)) || name.includes(' : ')) {
        return `https://namu.wiki/w/${encodeURIComponent(name)}`;
    }

    // 기본값
    return `https://namu.wiki/w/${encodeURIComponent(name + '(승리의 여신: 니케)')}`;
}

