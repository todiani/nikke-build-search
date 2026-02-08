import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeName, normalizeValue, WEAPON_MAP, CLASS_MAP, COMPANY_MAP, CODE_MAP, BURST_MAP } from '../src/utils/nikkeConstants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'nikke_db.json');

function getDataRichness(nikke) {
    let score = 0;
    if (nikke.name_en) score += 1;
    if (nikke.tier && nikke.tier !== 'Unranked') score += 2;
    if (nikke.burst && nikke.burst !== '확인 필요') score += 1;
    if (nikke.class && nikke.class !== '확인 필요') score += 1;
    if (nikke.weapon && nikke.weapon !== '확인 필요') score += 1;
    if (nikke.skill_priority) score += 2;
    if (nikke.cube) score += 1;
    if (nikke.desc) score += 1;
    
    if (nikke.skills) {
        const s = nikke.skills;
        if (s.min) score += 2;
        if (s.efficient) score += 2;
        if (s.max) score += 2;
    }
    
    if (nikke.options && nikke.options.length > 0) score += 3;
    if (nikke.valid_options && nikke.valid_options.length > 0) score += 3;
    
    if (nikke.skills_detail) {
        const sd = nikke.skills_detail;
        ['skill1', 'skill2', 'burst'].forEach(key => {
            if (sd[key]) {
                if (sd[key].name) score += 2;
                if (sd[key].desc) score += 3;
                if (sd[key].tags && sd[key].tags.length > 0) score += 4;
            }
        });
    }
    return score;
}

function mergeNikkeData(base, other) {
    const merged = { ...base };
    
    const simpleFields = ['name_en', 'skill_priority', 'cube', 'desc', 'extra_info'];
    simpleFields.forEach(f => {
        if (!merged[f] || merged[f] === '') {
            if (other[f]) merged[f] = other[f];
        }
    });
    
    if (merged.tier === 'Unranked' || !merged.tier) {
        if (other.tier && other.tier !== 'Unranked') merged.tier = other.tier;
    }
    
    ['burst', 'class', 'weapon', 'company', 'code'].forEach(f => {
        if (!merged[f] || merged[f] === '확인 필요') {
            if (other[f] && other[f] !== '확인 필요') merged[f] = other[f];
        }
    });
    
    if (!merged.skills || !merged.skills.efficient) {
        if (other.skills && other.skills.efficient) merged.skills = other.skills;
    }
    
    const baseOpts = new Set(merged.options || []);
    const otherOpts = other.options || [];
    otherOpts.forEach(o => baseOpts.add(o));
    merged.options = Array.from(baseOpts);
    
    if (!merged.skills_detail) merged.skills_detail = {};
    if (other.skills_detail) {
        ['skill1', 'skill2', 'burst'].forEach(key => {
            const baseSkill = merged.skills_detail[key] || {};
            const otherSkill = other.skills_detail[key] || {};
            
            if (otherSkill.desc && !baseSkill.desc) {
                merged.skills_detail[key] = otherSkill;
            } else if (baseSkill.desc && otherSkill.desc) {
                const baseTags = new Set(baseSkill.tags || []);
                const otherTags = otherSkill.tags || [];
                otherTags.forEach(t => baseTags.add(t));
                merged.skills_detail[key] = { ...baseSkill, tags: Array.from(baseTags) };
            }
        });
    }
    
    return merged;
}

function mergeDuplicates() {
    if (!fs.existsSync(DB_PATH)) {
        console.error('DB not found');
        return;
    }
    
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const nikkes = db.nikkes || [];
    console.log(`Loaded ${nikkes.length} nikkes`);
    
    const groups = {};
    nikkes.forEach(n => {
        const normName = normalizeName(n.name);
        if (!groups[normName]) groups[normName] = [];
        groups[normName].push(n);
    });
    
    const mergedData = [];
    Object.entries(groups).forEach(([normName, entries]) => {
        if (entries.length === 1) {
            mergedData.push(entries[0]);
        } else {
            console.log(`Merging ${entries.length} entries for ${normName}`);
            entries.sort((a, b) => getDataRichness(b) - getDataRichness(a));
            
            let base = entries[0];
            for (let i = 1; i < entries.length; i++) {
                base = mergeNikkeData(base, entries[i]);
            }
            
            // Normalize the merged result
            base.weapon = normalizeValue(base.weapon, WEAPON_MAP);
            base.class = normalizeValue(base.class, CLASS_MAP);
            base.company = normalizeValue(base.company, COMPANY_MAP);
            base.code = normalizeValue(base.code, CODE_MAP);
            base.burst = normalizeValue(base.burst, BURST_MAP);
            
            mergedData.push(base);
        }
    });
    
    mergedData.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    
    db.nikkes = mergedData;
    db.meta.last_updated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log(`Merged results: ${mergedData.length} nikkes`);
}

mergeDuplicates();
