import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    WEAPON_MAP,
    CLASS_MAP,
    COMPANY_MAP,
    CODE_MAP,
    BURST_MAP,
    SQUAD_MAP,
    normalizeValue,
    normalizeName
} from '../src/utils/nikkeConstants.js';
import { OVERLOAD_DATA } from '../src/data/game_constants.js';
import { TAG_DATA } from '../src/data/tags.js';

function extractTags(skillName, skillDesc) {
    if (!skillName && !skillDesc) return [];
    const allTags = [];
    for (const group of Object.values(TAG_DATA.tag_groups)) {
        allTags.push(...group.tags);
    }
    const uniqueTags = Array.from(new Set(allTags));
    const fullText = `${skillName || ''} ${skillDesc || ''}`;
    const matchedTags = [];
    for (const tag of uniqueTags) {
        const cleanTag = tag.replace(/[▲▼]/g, '').trim();
        if (!cleanTag) continue;
        const pattern = new RegExp(cleanTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        if (pattern.test(fullText)) matchedTags.push(tag);
    }
    return matchedTags;
}

const OVERLOAD_TYPE_MAP = {
    "공격력": "공격력 증가",
    "방어력": "방어력 증가",
    "체력": "방어력 증가", // 체력 옵션은 오버로드에 없으므로 방어력으로 매핑하거나 무시
    "명중률": "명중률 증가",
    "최대 장탄 수": "최대 장탄 수 증가",
    "차지 속도": "차지 속도 증가",
    "차지 대미지": "차지 대미지 증가",
    "우월코드 대미지": "우월코드 대미지 증가",
    "크리티컬 확률": "크리티컬 확률 증가",
    "크리티컬 대미지": "크리티컬 대미지 증가"
};

function mapValueToStage(type, valueStr) {
    if (!type || type === "옵션없음" || type === "효과없음") return 0;
    if (!valueStr) return 1;
    const value = parseFloat(valueStr.replace(/[%+,]/g, ''));
    if (isNaN(value)) return 0;

    // 실제 타입명으로 변환
    const actualType = OVERLOAD_TYPE_MAP[type] || type;
    const stages = OVERLOAD_DATA[actualType];
    if (!stages) return 0;

    let closestIdx = 1;
    let minDiff = Math.abs(stages[1] - value);

    for (let i = 2; i < stages.length; i++) {
        const diff = Math.abs(stages[i] - value);
        if (diff < minDiff) {
            minDiff = diff;
            closestIdx = i;
        }
    }
    return closestIdx;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'nikke_db.json');
const BUILDS_DIR = path.join(__dirname, '..', 'public', 'data', 'builds');
const TAMPERMONKEY_DATA_DIR = path.join(__dirname, '..', 'Tampermonkey Script', 'DATA');

function mergeTampermonkeyData(targetFile = null) {
    console.log(targetFile ? `Starting sync for specific file: ${targetFile}` : 'Starting merge from Tampermonkey DATA using unified constants...');

    // Ensure builds directory exists
    if (!fs.existsSync(BUILDS_DIR)) {
        fs.mkdirSync(BUILDS_DIR, { recursive: true });
    }

    // 1. Load Main DB
    if (!fs.existsSync(DB_PATH)) {
        console.error('Main DB not found at:', DB_PATH);
        return;
    }
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

    // Clean up companies list as requested by user
    if (db.masters && db.masters.companies) {
        const originalCompanies = db.masters.companies;
        db.masters.companies = originalCompanies.filter(c => c !== '기업:어브노멀');
        if (originalCompanies.length !== db.masters.companies.length) {
            console.log('Removed "기업:어브노멀" from companies list.');
        }
    }

    const nikkes = db.nikkes || [];
    const nikkeMap = new Map();
    const nameMap = new Map(); // Name-based lookup to prevent duplicates

    nikkes.forEach(n => {
        nikkeMap.set(n.id, n);
        nameMap.set(normalizeName(n.name), n);
    });

    // 2. Load Tampermonkey Data
    if (!fs.existsSync(TAMPERMONKEY_DATA_DIR)) {
        console.warn('Tampermonkey DATA directory not found.');
        return;
    }

    const allFiles = fs.readdirSync(TAMPERMONKEY_DATA_DIR).filter(f => f.endsWith('.json'));
    const files = targetFile ? allFiles.filter(f => f === targetFile) : allFiles;

    if (targetFile && files.length === 0) {
        console.error(`Target file not found in DATA directory: ${targetFile}`);
        return;
    }

    let updatedCount = 0;
    let addedCount = 0;

    // Manual mapping for cases where name doesn't match ID or needs manual override
    const MANUAL_NAME_TO_ID = {
        "라피 : 레드 후드": "16",
        "신데렐라": "511",
        "레드 후드": "470",
        "모더니아": "72"
        // Add more manual mappings here if needed
    };

    files.forEach(file => {
        const filePath = path.join(TAMPERMONKEY_DATA_DIR, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);

            // Step 1: Resolve ID
            let id = null;
            const match = file.match(/\((\d+)\)/);
            if (match) {
                id = match[1];
            } else if (data.id && !isNaN(data.id)) {
                id = data.id;
            }

            // Step 2: Compatibility Layer (Namuwiki vs Blablalink)
            const meta = data.meta || data;
            if (!meta || !meta.name) return;

            // Step 3: Match with DB (ID first, then Name fallback)
            let existing = null;
            if (id && nikkeMap.has(id.toString())) {
                existing = nikkeMap.get(id.toString());
            } else {
                const normName = normalizeName(meta.name);
                // Check manual map first
                const manualId = MANUAL_NAME_TO_ID[meta.name] || MANUAL_NAME_TO_ID[normName];
                if (manualId && nikkeMap.has(manualId)) {
                    existing = nikkeMap.get(manualId);
                    id = manualId;
                } else if (nameMap.has(normName)) {
                    existing = nameMap.get(normName);
                    id = existing.id;
                }
            }

            // If still no match and we have a new ID, we might add a new Nikke later
            // But for now, we focus on updating what you have.

            // Process Equipment Options
            const equipment = data.equipment || [];
            const overloadBuild = {
                helmet: { option1: { type: "옵션없음", stage: 0 }, option2: { type: "옵션없음", stage: 0 }, option3: { type: "옵션없음", stage: 0 } },
                armor: { option1: { type: "옵션없음", stage: 0 }, option2: { type: "옵션없음", stage: 0 }, option3: { type: "옵션없음", stage: 0 } },
                gloves: { option1: { type: "옵션없음", stage: 0 }, option2: { type: "옵션없음", stage: 0 }, option3: { type: "옵션없음", stage: 0 } },
                boots: { option1: { type: "옵션없음", stage: 0 }, option2: { type: "옵션없음", stage: 0 }, option3: { type: "옵션없음", stage: 0 } }
            };

            const partMap = { 1: 'helmet', 2: 'armor', 3: 'gloves', 4: 'boots' };
            equipment.forEach(part => {
                const partName = partMap[part.partIndex];
                if (partName && part.options) {
                    part.options.forEach((opt, idx) => {
                        // Use opt.slot if available, otherwise fallback to index
                        const slotIdx = (opt.slot && opt.slot >= 1 && opt.slot <= 3) ? opt.slot : (idx + 1);
                        if (slotIdx <= 3) {
                            const optKey = `option${slotIdx}`;
                            const normalizedType = OVERLOAD_TYPE_MAP[opt.name] || opt.name;
                            overloadBuild[partName][optKey] = {
                                type: normalizedType,
                                stage: mapValueToStage(opt.name, opt.value)
                            };
                        }
                    });
                }
            });

            const nikkeInfo = {
                id: id,
                name: meta.name,
                burst: normalizeValue(meta.burst, BURST_MAP),
                class: normalizeValue(meta.class, CLASS_MAP),
                weapon: normalizeValue(meta.weapon, WEAPON_MAP),
                squad: normalizeValue(meta.squad, SQUAD_MAP),
                company: normalizeValue(meta.company, COMPANY_MAP),
                code: normalizeValue(meta.code, CODE_MAP),
                rarity: meta.rarity,
                cv: meta.cv,
                cv_jp: meta.cv_jp,
                cv_en: meta.cv_en,
                stats: data.stats,
                overload: overloadBuild,
                skills_detail: data.skills_detail
            };

            if (existing) {
                // Update existing
                console.log(`Matching found: ${existing.name} (${id})`);

                // Update basic fields
                const fieldsToUpdate = ['burst', 'class', 'weapon', 'squad', 'company', 'code', 'rarity', 'cv', 'cv_jp', 'cv_en'];
                let changed = false;

                fieldsToUpdate.forEach(field => {
                    const mandatoryFields = ['burst', 'class', 'weapon', 'squad', 'company', 'code'];
                    if (mandatoryFields.includes(field)) {
                        if (nikkeInfo[field] === 'Unknown' || nikkeInfo[field] === '확인 필요') {
                            console.error(`[Error] Mandatory field '${field}' is '${nikkeInfo[field]}' for Nikke: ${nikkeInfo.name} (${id})`);
                            process.exit(1);
                        }
                    }
                    if (nikkeInfo[field]) {
                        if (existing[field] !== nikkeInfo[field]) {
                            existing[field] = nikkeInfo[field];
                            changed = true;
                        }
                    }
                });

                // Update build info (stats, overload, skills, cube, collection)
                if (!existing.build) existing.build = {};

                if (nikkeInfo.stats) {
                    existing.build.stats = {
                        ...existing.build.stats,
                        ...nikkeInfo.stats
                    };
                    changed = true;
                }

                if (nikkeInfo.overload) {
                    existing.build.overload = nikkeInfo.overload;
                    changed = true;
                }

                // New: Update skills, cube, collection from extractor
                if (data.skills) {
                    existing.build.skills = data.skills;
                    changed = true;
                }
                if (data.cube) {
                    existing.build.cube_level = data.cube.level;
                    changed = true;
                }
                // Update skills_detail (Auto-extract tags if not present)
                if (nikkeInfo.skills_detail) {
                    const updatedSkills = {};
                    for (const [key, skill] of Object.entries(nikkeInfo.skills_detail)) {
                        updatedSkills[key] = {
                            ...skill,
                            tags: (skill.tags && skill.tags.length > 0) ? skill.tags : extractTags(skill.name, skill.desc)
                        };
                    }
                    existing.skills_detail = {
                        ...(existing.skills_detail || {}),
                        ...updatedSkills
                    };
                    changed = true;
                }

                // Update individual build file in public/data/builds/
                const buildFilePath = path.join(BUILDS_DIR, `${id}.json`);
                if (fs.existsSync(buildFilePath)) {
                    try {
                        const buildData = JSON.parse(fs.readFileSync(buildFilePath, 'utf8'));

                        // Update basic fields
                        fieldsToUpdate.forEach(field => {
                            if (nikkeInfo[field] === 'Unknown' || nikkeInfo[field] === '확인 필요') {
                                // Already caught above, but for safety:
                                throw new Error(`Mandatory field '${field}' is invalid for ${nikkeInfo.name}`);
                            }
                            if (nikkeInfo[field]) {
                                buildData[field] = nikkeInfo[field];
                            }
                        });

                        if (!buildData.build) buildData.build = {};
                        if (nikkeInfo.stats) {
                            buildData.build.stats = {
                                ...buildData.build.stats,
                                ...nikkeInfo.stats
                            };
                        }
                        if (nikkeInfo.overload) {
                            buildData.build.overload = nikkeInfo.overload;
                        }

                        // New: Update skills, cube, collection from extractor
                        if (data.skills) {
                            buildData.build.skills = data.skills;
                        }
                        if (data.cube) {
                            buildData.build.cube_level = data.cube.level;
                        }
                        if (data.collection) {
                            buildData.build.collection = data.collection;
                        }

                        // Update skills_detail from Namuwiki data with tag extraction
                        if (nikkeInfo.skills_detail) {
                            const updatedSkills = {};
                            for (const [key, skill] of Object.entries(nikkeInfo.skills_detail)) {
                                updatedSkills[key] = {
                                    ...skill,
                                    tags: (skill.tags && skill.tags.length > 0) ? skill.tags : extractTags(skill.name, skill.desc)
                                };
                            }
                            buildData.skills_detail = {
                                ...(buildData.skills_detail || {}),
                                ...updatedSkills
                            };
                        }

                        // Update extra fields
                        if (meta.rarity) buildData.rarity = meta.rarity;
                        if (meta.cv) buildData.cv = meta.cv;
                        if (meta.cv_jp) buildData.cv_jp = meta.cv_jp;
                        if (meta.cv_en) buildData.cv_en = meta.cv_en;

                        fs.writeFileSync(buildFilePath, JSON.stringify(buildData, null, 2));
                    } catch (err) {
                        console.error(`Error updating build file ${buildFilePath}:`, err);
                    }
                } else {
                    // Create new build file if it doesn't exist
                    const newBuildData = {
                        ...existing,
                        id: id,
                        _originalId: id,
                        _dbId: id
                    };
                    fs.writeFileSync(buildFilePath, JSON.stringify(newBuildData, null, 2));
                }

                if (changed) {
                    updatedCount++;
                }
            } else if (id) {
                // Add new (only if we have a valid ID)
                console.log(`No match found. Adding as new Nikke: ${nikkeInfo.name} (${id})`);
                const newNikke = {
                    id: id,
                    name: nikkeInfo.name,
                    name_en: nikkeInfo.name,
                    tier: 'Unranked',
                    burst: nikkeInfo.burst,
                    class: nikkeInfo.class,
                    weapon: nikkeInfo.weapon,
                    squad: nikkeInfo.squad,
                    company: nikkeInfo.company,
                    role: nikkeInfo.class,
                    code: nikkeInfo.code,
                    build: {
                        stats: nikkeInfo.stats,
                        overload: nikkeInfo.overload,
                        skills: data.skills || { skill1: 1, skill2: 1, burst: 1 },
                        cube_level: data.cube?.level || 1,
                        collection: data.collection || { grade: "None", skill1: 1, skill2: 1 }
                    },
                    skills_detail: {
                        skill1: { name: '', desc: '', tags: [] },
                        skill2: { name: '', desc: '', tags: [] },
                        burst: { name: '', desc: '', tags: [] },
                        normal: { name: '' }
                    },
                    overload_detail: { priority: '', options: [], recommended_cubes: [], notes: '' },
                    skill_priority: '',
                    options: [],
                    cube: '',
                    desc: '',
                    extra_info: '',
                    usage_stats: []
                };

                // Add rarity and cv if available
                if (meta.rarity) newNikke.rarity = meta.rarity;
                if (meta.cv) newNikke.cv = meta.cv;

                nikkes.push(newNikke);
                nikkeMap.set(id, newNikke);
                addedCount++;

                // Create new build file
                const buildFilePath = path.join(BUILDS_DIR, `${id}.json`);
                fs.writeFileSync(buildFilePath, JSON.stringify(newNikke, null, 2));
            }

        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    });

    // 3. Save Updated DB
    db.nikkes = nikkes;
    db.meta.last_updated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

    console.log(`Merge complete!`);
    console.log(`Updated: ${updatedCount} Nikkes`);
    console.log(`Added: ${addedCount} Nikkes`);
}

const targetFile = process.argv[2];
mergeTampermonkeyData(targetFile);
