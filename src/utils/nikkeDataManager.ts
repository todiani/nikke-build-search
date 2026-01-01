import type { NikkeData, PartOptions } from '../data/nikkes';
import { BURST_DB, setBurstDB, getBurstDB } from '../data/burst_db';
import { NIKKE_BUILDS_DB, getNikkeBuild, setNikkeBuildsDB } from '../data/nikke_builds_db';
import { TAG_DATA } from '../data/tags';

// --- Tier to Stars Mapping ---
const TIER_TO_STARS: Record<string, number> = {
    'SSS': 5,
    'SS': 4,
    'S': 3,
    'A': 2,
    'B': 1,
    'C': 0,
    'Unranked': 1,
    'PvP': 4
};

// --- String Normalization ---
export const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase();

// --- PVP Tier Lookup ---
const PVP_TIERS: Record<string, string> = {
    "자칼": "SSS",
    "비스킷": "SSS",
    "노아": "SSS",
    "홍련": "SSS",
    "에밀리아": "SSS",
    "라푼젤": "SS",
    "로잔나 : 시크 플라워": "SS",
    "레드 후드": "SS",
    "아니스 : 스파클링 서머": "SS",
    "누아르": "S",
    "블랑": "S",
    "앨리스": "S",
    "페퍼": "A",
    "드레이크": "A",
    "센티": "A"
};

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

// --- 최신 분야별 티어 데이터 (Perplexity 검색 결과 기반 2025 메타) ---
const LATEST_TIERS: Record<string, Record<string, number>> = {
    '스테이지': {
        '라피 : 레드 후드': 5, '스노우 화이트 : 헤비암즈': 5, '리틀 머메이드': 5, '크라운': 5, '나유타': 5, '홍련 : 흑영': 5, '신데렐라': 5, '리버렐리오': 5,
        '미하라 : 본딩 체인': 5, '모더니아': 5, '리타': 5, '나가': 5, '티아': 5, '블랑': 5, '누아르': 5,
        '그레이브': 4, '마리': 4, '루주': 4, '토브': 4, 'D : 킬러 와이프': 4, '미란다': 4,
        '앨리스': 4, '도로시': 4, '라푼젤': 4, '홍련': 4, '헬름': 4,
        '에이다': 3, '센티': 3, '길티': 3, '노벨': 3, '아니스 : 스파클링 서머': 3, '프리바티': 3
    },
    '솔로레이드': {
        '크라운': 5, '홍련 : 흑영': 5, '리버렐리오': 5, '라피 : 레드 후드': 5, '스노우 화이트 : 헤비암즈': 5, '리틀 머메이드': 5, '신데렐라': 5, '나유타': 5,
        '앨리스': 5, '맥스웰': 5, '백설공주': 5, '아니스 : 스파클링 서머': 5, '리타': 5, '도로시': 5, '루주': 5, '모더니아': 5,
        '토브': 4, 'D : 킬러 와이프': 4, '미란다': 4, '그레이브': 4, '마리': 4, '드레이크': 4, '헬름': 4,
        '에이다': 4, '센티': 4, '길티': 4, '누아르': 4, '블랑': 4, '나가': 4, '티아': 4,
        '아니스 : 스파클': 3, '프리바티': 3, '마키마': 3, '파워': 3, '루피': 3, '엠마': 3, '자칼': 3
    },
    '유니온레이드': {
        '크라운': 5, '홍련 : 흑영': 5, '리버렐리오': 5, '라피 : 레드 후드': 5, '스노우 화이트 : 헤비암즈': 5, '리틀 머메이드': 5, '신데렐라': 5, '나유타': 5,
        '미하라 : 본딩 체인': 5, '헬름': 5, '루주': 5, '모더니아': 5,
        '리타': 4, '토브': 4, 'D : 킬러 와이프': 4, '미란다': 4, '그레이브': 4, '마리': 4, '앨리스': 4, '드레이크': 4,
        '에이다': 4, '센티': 4, '길티': 4, '누아르': 4,
        '블랑': 3, '아니스 : 스파클': 3, '프리바티': 3, '마키마': 3, '파워': 3, '루피': 3, '엠마': 3, '자칼': 3
    },
    'PVP': {
        '자칼': 5, '비스킷': 5, '노아': 5, '홍련': 5, '에밀리아': 5, '라피 : 레드 후드': 5, '리틀 머메이드': 5, '크라운': 5, '신데렐라': 5, '홍련 : 흑영': 5,
        '센티': 4, '길티': 4, '마키마': 4, '네로': 4, '베이': 4, '노이즈': 4, '슈가': 4, '로산나': 4, '아니스 : 스파클링 서머': 4,
        '리타': 3, '도로시': 3, '라푼젤': 3, '모더니아': 3, '폴크방': 3, '레오나': 3, '에이드': 3, '일레그': 3
    },
    '이상개체요격전': {
        '홍련 : 흑영': 5, '크라운': 5, '리버렐리오': 5, '리틀 머메이드': 5, '라피 : 레드 후드': 5, '스노우 화이트 : 헤비암즈': 5, '신데렐라': 5, '나유타': 5,
        '미하라 : 본딩 체인': 5, '헬름': 5, '모더니아': 5,
        '리타': 4, '루주': 4, '토브': 4, 'D : 킬러 와이프': 4, '미란다': 4, '그레이브': 4, '앨리스': 4, '에이다': 4, '센티': 4,
        '드레이크': 3, '아스카': 3, '이브': 3, '레이븐': 3, '누아르': 3, '블랑': 3, '프리바티': 3, '마키마': 3
    },
    '기업타워': {
        // 필그림
        '라피 : 레드 후드': 5, '신데렐라': 5, '나유타': 5, '크라운': 5, '모더니아': 5, '홍련 : 흑영': 5, '리틀 머메이드': 5, '리버렐리오': 5, '스노우 화이트 : 헤비암즈': 5,
        '도로시': 4, '라푼젤': 4, '홍련': 4, '그레이브': 4, '스노우 화이트': 4,
        '노아': 3, '하란': 3, '이사벨': 3, '스노우 화이트 : 이노센트 데이즈': 3,
        
        // 테트라
        '앨리스': 5, '블랑': 5, '누아르': 5, '루주': 5, '비스킷': 5, '아니스 : 스파클링 서머': 5,
        '노이즈': 4, '볼륨': 4, '루피': 4, '사쿠라': 4, '로산나 : 시크 오션': 4, '바니 소다': 4, '바니 앨리스': 4,
        '바이퍼': 3, '네로': 3, '메어리 : 베이 갓데스': 3, '베이': 3, '루마니': 3, '플로라': 3,
        
        // 미실리스
        '리타': 5, '나가': 5, '티아': 5, '센티': 5, '아인': 5, '맥스웰': 5,
        '드레이크': 4, '라플라스': 4, '일레그': 4, '킬로': 4, '츠바이': 4,
        '유니': 3, '애드미': 3, '에피넬': 3, '자칼': 3,
        
        // 엘리시온
        '미하라 : 본딩 체인': 5, '마리': 5, '프리바티': 5, '헬름': 5, 'D : 킬러 와이프': 5,
        '마르차나': 4, '길로틴': 4, '미란다': 4, '폴리': 4, '디젤': 4, '쿼리': 4,
        '은화': 3, '브리드': 3, '솔린': 3, '엠마': 3, '네온': 3
    },
    '트라이브타워': {
        '라피 : 레드 후드': 5, '스노우 화이트 : 헤비암즈': 5, '크라운': 5, '모더니아': 5, '홍련 : 흑영': 5, '신데렐라': 5, '리타': 5, '앨리스': 5, '블랑': 5, '누아르': 5, '나가': 5, '티아': 5,
        '도로시': 4, '라푼젤': 4, '센티': 4, '아인': 4, '루주': 4, 'D : 킬러 와이프': 4, '맥스웰': 4, '일레그': 4,
        '드레이크': 3, '라플라스': 3, '헬름': 3, '프리바티': 3, '노이즈': 3, '볼륨': 3, '비스킷': 3
    }
};

export const initializeNikkeData = (nikke: NikkeData): NikkeData => {
    const updated = { ...nikke };

    // Use DB values if available, otherwise fallback to constants
    const tierToStars = (cachedMasters.tier_to_stars && Object.keys(cachedMasters.tier_to_stars).length > 0) 
        ? cachedMasters.tier_to_stars 
        : TIER_TO_STARS;
    
    const pvpRankings = (cachedMasters.pvp_rankings && Object.keys(cachedMasters.pvp_rankings).length > 0)
        ? cachedMasters.pvp_rankings
        : PVP_TIERS;
    
    const latestTiers = (cachedMasters.latest_tiers && Object.keys(cachedMasters.latest_tiers).length > 0)
        ? cachedMasters.latest_tiers
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
                option1: { type: "None", stage: 0 },
                option2: { type: "None", stage: 0 },
                option3: { type: "None", stage: 0 }
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
    latest_tiers: LATEST_TIERS, // Initialize with default 2025 meta tiers
    colors: {
        code_text: {},
        burst: {},
        class: {},
        company: {},
        weapon: {},
        code: {},
        tier: {},
        rarity: {}
    }
};

const uniq = (arr: (string | undefined | null)[]) =>
    Array.from(new Set(arr.map(v => (v ?? '').trim()).filter(Boolean)));

const sortWithPreferredOrder = (values: string[], preferredOrder: string[]) => {
    const preferred = new Map(preferredOrder.map((v, i) => [v, i] as const));
    return [...values].sort((a, b) => {
        const ai = preferred.has(a) ? (preferred.get(a) as number) : Number.MAX_SAFE_INTEGER;
        const bi = preferred.has(b) ? (preferred.get(b) as number) : Number.MAX_SAFE_INTEGER;
        if (ai !== bi) return ai - bi;
        return a.localeCompare(b, 'ko');
    });
};

const buildMastersFromData = (nikkes: NikkeData[], squads: string[]): MasterData => {
    const tiers = sortWithPreferredOrder(
        uniq(nikkes.map(n => n.tier)),
        ['SSS', 'SS', 'S', 'A', 'PvP', 'Unranked']
    );
    const companies = sortWithPreferredOrder(
        uniq(nikkes.map(n => n.company)),
        ['엘리시온', '미실리스', '테트라', '필그림', '어브노멀']
    );
    const codes = sortWithPreferredOrder(
        uniq(nikkes.map(n => n.code)),
        ['작열', '풍압', '철갑', '전격', '수냉']
    );
    const bursts = sortWithPreferredOrder(
        uniq(nikkes.map(n => n.burst)),
        ['I', 'II', 'III', 'A']
    );
    const weapons = sortWithPreferredOrder(
        uniq(nikkes.map(n => n.weapon)),
        ['AR', 'SR', 'SG', 'SMG', 'RL', 'MG']
    );
    const classes = sortWithPreferredOrder(
        uniq(nikkes.map(n => n.class)),
        ['Attacker', 'Supporter', 'Defender']
    );
    const rarities = sortWithPreferredOrder(
        uniq(nikkes.map(n => n.rarity)),
        ['SSR', 'SR', 'R']
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
        tiers: sortWithPreferredOrder(uniq([...(cachedMasters.tiers || []), ...(rebuilt.tiers || [])]), ['SSS', 'SS', 'S', 'A', 'PvP', 'Unranked']),
        companies: sortWithPreferredOrder(uniq([...(cachedMasters.companies || []), ...(rebuilt.companies || [])]), ['엘리시온', '미실리스', '테트라', '필그림', '어브노멀']),
        codes: sortWithPreferredOrder(uniq([...(cachedMasters.codes || []), ...(rebuilt.codes || [])]), ['작열', '풍압', '철갑', '전격', '수냉']),
        bursts: sortWithPreferredOrder(uniq([...(cachedMasters.bursts || []), ...(rebuilt.bursts || [])]), ['I', 'II', 'III', 'A']),
        weapons: sortWithPreferredOrder(uniq([...(cachedMasters.weapons || []), ...(rebuilt.weapons || [])]), ['AR', 'SR', 'SG', 'SMG', 'RL', 'MG']),
        classes: sortWithPreferredOrder(uniq([...(cachedMasters.classes || []), ...(rebuilt.classes || [])]), ['Attacker', 'Supporter', 'Defender']),
        rarities: sortWithPreferredOrder(uniq([...(cachedMasters.rarities || []), ...(rebuilt.rarities || [])]), ['SSR', 'SR', 'R']),
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
        }
    };
    cachedSquads = cachedMasters.squads;
};

export const getMasters = () => cachedMasters;

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

            cachedSquads = json.squads || [];
            
            // Populate masters first so initializeNikkeData can use them
            // Ensure latest_tiers is merged with default LATEST_TIERS if missing or incomplete
            const loadedMasters = json.masters || {};
            cachedMasters = {
                ...buildMastersFromData([], cachedSquads), // Base with all required fields
                ...loadedMasters, // Overwrite with loaded data
                latest_tiers: {
                    ...LATEST_TIERS, // Default 2025 tiers
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

// Save helper
const saveDB = async () => {
    try {
        // --- SAFETY CHECK ---
        // 1. If DB hasn't been loaded yet, we should NOT save.
        if (!isDBLoaded) {
            console.warn("[Safety] Attempted to save DB before it was loaded. Aborting to prevent data loss.");
            return;
        }

        // 2. If cachedNikkes is empty, it's highly likely a load failure or race condition.
        if (cachedNikkes.length === 0) {
            console.warn("[Safety] Attempted to save DB with 0 nikkes. Aborting to prevent data loss.");
            return;
        }

        // 3. Additional safety: If critical collections are empty but we expect them not to be,
        // we might want to log a warning or abort. But since users can delete all, we just log.
        if (cachedMetaTeams.length === 0) console.log("[Info] Saving with empty meta_teams");
        if (Object.keys(cachedTowerSquads).length === 0) console.log("[Info] Saving with empty tower_squads");
        if (cachedSavedTeams.length === 0) console.log("[Info] Saving with empty saved_teams");

        // 1. Separate Build and Burst Data from Nikke Data
        const builds: Record<string, any> = {};
        const bursts: Record<string, any> = {};
        
        const nikkesWithoutBuild = cachedNikkes.map(n => {
            const { build, burst_details, ...rest } = n;
            const cleanName = n.name.split('(')[0].trim();
            
            if (build) {
                builds[cleanName] = build;
            }
            
            if (burst_details) {
                bursts[cleanName] = burst_details;
            }
            
            return rest;
        });

        // 2. Save Build Data
        await fetch('http://localhost:3001/api/nikke-builds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(builds)
        });

        // 3. Save Burst Data
        await fetch('http://localhost:3001/api/burst-db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bursts)
        });

        // 4. Save Main DB (without build and burst data)
        const payload = {
            meta: { version: "1.1", last_updated: new Date().toISOString() },
            squads: cachedSquads,
            masters: cachedMasters,
            nikkes: nikkesWithoutBuild,
            meta_teams: cachedMetaTeams,
            tower_squads: cachedTowerSquads,
            saved_teams: cachedSavedTeams,
            backup_settings: cachedBackupSettings,
            backup_history: cachedBackupHistory,
            tags: cachedTags
        };
        await fetch('http://localhost:3001/api/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        console.log("DB and Builds Saved Successfully");
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nikke-db-updated'));
        }
    } catch (e) {
        console.error("Failed to save DB", e);
    }
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
    await saveDB();
};

export const deleteNikkeData = async (id: string) => {
    cachedNikkes = cachedNikkes.filter(n => n.id !== id);
    await saveDB();
};

