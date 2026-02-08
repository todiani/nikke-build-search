import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeName, normalizeValue, WEAPON_MAP, CLASS_MAP, COMPANY_MAP, CODE_MAP, BURST_MAP } from '../src/utils/nikkeConstants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'nikke_db.json');
const BUILDS_DIR = path.join(__dirname, '..', 'public', 'data', 'builds');

function syncData() {
    console.log('Starting synchronization...');

    // 1. Load Main DB
    if (!fs.existsSync(DB_PATH)) {
        console.error('Main DB not found at:', DB_PATH);
        return;
    }
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const nikkes = db.nikkes || [];

    // 2. Load Individual Builds
    const buildFiles = fs.readdirSync(BUILDS_DIR).filter(f => f.endsWith('.json'));
    const buildDataMap = new Map();

    buildFiles.forEach(file => {
        const filePath = path.join(BUILDS_DIR, file);
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (data.name) {
                // Use unified normalizeName
                const normName = normalizeName(data.name);
                buildDataMap.set(normName, { ...data, _fileName: file });
            }
        } catch (e) {
            console.error(`Error reading ${file}:`, e);
        }
    });

    console.log(`Loaded ${buildDataMap.size} build files.`);

    // 3. Merge Data
    let updatedCount = 0;
    const updatedNikkes = nikkes.map(nikke => {
        const normName = normalizeName(nikke.name);
        const buildInfo = buildDataMap.get(normName);

        // 정규화 적용
        nikke.weapon = normalizeValue(nikke.weapon, WEAPON_MAP);
        nikke.class = normalizeValue(nikke.class, CLASS_MAP);
        nikke.company = normalizeValue(nikke.company, COMPANY_MAP);
        nikke.code = normalizeValue(nikke.code, CODE_MAP);
        nikke.burst = normalizeValue(nikke.burst, BURST_MAP);

        if (buildInfo) {
            updatedCount++;
            // Merge build info into nikke entry
            return {
                ...nikke,
                build: buildInfo.build,
                skills_detail: buildInfo.skills_detail || nikke.skills_detail,
                _buildFile: buildInfo._fileName
            };
        }
        return nikke;
    });

    // 4. Update Main DB
    db.nikkes = updatedNikkes;
    db.meta.last_updated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log(`Updated ${updatedCount} Nikkes in main DB.`);

    // 5. Update Individual Files with DB Metadata (Reverse Sync)
    updatedNikkes.forEach(nikke => {
        const normName = normalizeName(nikke.name);
        const buildInfo = buildDataMap.get(normName);

        if (buildInfo) {
            const filePath = path.join(BUILDS_DIR, buildInfo._fileName);
            
            // Individual file normalization as well
            const normalizedNikke = {
                ...nikke,
                weapon: normalizeValue(nikke.weapon, WEAPON_MAP),
                class: normalizeValue(nikke.class, CLASS_MAP),
                company: normalizeValue(nikke.company, COMPANY_MAP),
                code: normalizeValue(nikke.code, CODE_MAP),
                burst: normalizeValue(nikke.burst, BURST_MAP)
            };

            const updatedIndividualData = {
                ...buildInfo,
                ...normalizedNikke, 
                id: buildInfo.id, 
                _dbId: nikke.id 
            };
            delete updatedIndividualData._fileName;
            delete updatedIndividualData._buildFile;
            
            fs.writeFileSync(filePath, JSON.stringify(updatedIndividualData, null, 2));
        }
    });

    console.log('Synchronization complete.');
}

syncData();
