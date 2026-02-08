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
    normalizeValue 
} from '../src/utils/nikkeConstants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'nikke_db.json');
const BUILDS_DIR = path.join(__dirname, '..', 'public', 'data', 'builds');

function cleanupData() {
    console.log('Starting data cleanup and standardization using unified constants...');

    if (!fs.existsSync(DB_PATH)) {
        console.error('DB not found at:', DB_PATH);
        return;
    }

    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

    // 1. Standardize Masters
    if (db.masters) {
        const masterConfigs = [
            { key: 'companies', map: COMPANY_MAP },
            { key: 'codes', map: CODE_MAP },
            { key: 'bursts', map: BURST_MAP },
            { key: 'weapons', map: WEAPON_MAP },
            { key: 'classes', map: CLASS_MAP }
        ];

        masterConfigs.forEach(({ key, map }) => {
            if (db.masters[key]) {
                db.masters[key] = [...new Set(db.masters[key].map(v => normalizeValue(v, map)).filter(v => v !== "Unknown"))];
            }
        });

        if (db.masters.squads) {
            db.masters.squads = [...new Set(db.masters.squads.map(s => normalizeValue(s, SQUAD_MAP)).filter(s => s !== "-"))];
        }
    }

    // 2. Remove Root Squads (Redundant with masters.squads)
    if (db.squads) {
        delete db.squads;
        console.log('Removed redundant root squads key.');
    }

    // 3. Standardize Nikkes in Main DB
    if (db.nikkes) {
        db.nikkes.forEach(nikke => {
            nikke.company = normalizeValue(nikke.company, COMPANY_MAP);
            nikke.code = normalizeValue(nikke.code, CODE_MAP);
            nikke.burst = normalizeValue(nikke.burst, BURST_MAP);
            nikke.weapon = normalizeValue(nikke.weapon, WEAPON_MAP);
            nikke.class = normalizeValue(nikke.class, CLASS_MAP);
            nikke.squad = normalizeValue(nikke.squad, SQUAD_MAP);
        });
    }

    db.meta.last_updated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log('Main DB cleaned up successfully.');

    // 4. Standardize Individual Build Files
    if (fs.existsSync(BUILDS_DIR)) {
        const buildFiles = fs.readdirSync(BUILDS_DIR).filter(f => f.endsWith('.json'));
        buildFiles.forEach(file => {
            const filePath = path.join(BUILDS_DIR, file);
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                let changed = false;

                const fields = [
                    { key: 'company', map: COMPANY_MAP },
                    { key: 'code', map: CODE_MAP },
                    { key: 'burst', map: BURST_MAP },
                    { key: 'weapon', map: WEAPON_MAP },
                    { key: 'class', map: CLASS_MAP },
                    { key: 'squad', map: SQUAD_MAP }
                ];

                fields.forEach(({ key, map }) => {
                    const original = data[key];
                    const normalized = normalizeValue(original, map);
                    if (original !== normalized) {
                        data[key] = normalized;
                        changed = true;
                    }
                });

                if (changed) {
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                }
            } catch (e) {
                console.error(`Error cleaning ${file}:`, e);
            }
        });
        console.log(`Cleaned ${buildFiles.length} individual build files.`);
    }

    console.log('Cleanup complete!');
}

cleanupData();
