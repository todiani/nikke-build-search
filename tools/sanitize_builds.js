import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeName } from '../src/utils/nikkeConstants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'public', 'data', 'nikke_db.json');
const BUILDS_DIR = path.join(__dirname, '..', 'public', 'data', 'builds');

function sanitizeAndSync() {
    console.log('Starting Sanitization and Sync...');

    if (!fs.existsSync(DB_PATH)) {
        console.error('Main DB not found');
        return;
    }

    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const nikkes = db.nikkes || [];
    const buildFiles = fs.readdirSync(BUILDS_DIR).filter(f => f.endsWith('.json'));

    const buildDataMap = new Map();

    // 1. Try to extract 'build' and 'id' from potentially corrupted files
    buildFiles.forEach(file => {
        const filePath = path.join(BUILDS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        let data = null;
        try {
            data = JSON.parse(content);
        } catch (e) {
            // If JSON.parse fails, try to extract parts using Regex
            console.warn(`File ${file} is corrupted, attempting partial recovery...`);
            const nameMatch = content.match(/"name":\s*"([^"]+)"/);
            const buildMatch = content.match(/"build":\s*({[\s\S]*?})\s*,\s*"skills_detail"/);
            const idMatch = content.match(/"id":\s*"([^"]+)"/);

            if (nameMatch) {
                data = {
                    id: idMatch ? idMatch[1] : file.replace('.json', ''),
                    name: nameMatch[1],
                    build: null
                };
                if (buildMatch) {
                    try {
                        // Try to parse just the build object
                        data.build = JSON.parse(buildMatch[1]);
                    } catch (e2) {
                        console.error(`  Failed to recover build object for ${nameMatch[1]}`);
                    }
                }
            }
        }

        if (data && data.name) {
            const normalizedName = normalizeName(data.name);
            buildDataMap.set(normalizedName, data);
        }
    });

    // 2. Re-generate individual files and update main DB
    const updatedNikkes = nikkes.map(nikke => {
        const normalizedName = normalizeName(nikke.name);
        const recoveredData = buildDataMap.get(normalizedName);

        // Standardize ID: prefer numeric ID from builds if it exists
        const buildId = recoveredData ? recoveredData.id : nikke.id;
        
        const mergedNikke = {
            ...nikke,
            id: buildId, // Use the build ID (numeric if possible)
            _originalId: nikke.id, // Store old ID just in case
            build: recoveredData ? recoveredData.build : (nikke.build || null)
        };

        // Write cleaned individual file
        const fileName = `${buildId}.json`;
        const filePath = path.join(BUILDS_DIR, fileName);
        
        // Ensure we don't have duplicate files if IDs changed
        // (This is a bit risky but we want to move towards numeric IDs)
        
        fs.writeFileSync(filePath, JSON.stringify(mergedNikke, null, 2));
        
        return mergedNikke;
    });

    // 3. Save main DB
    db.nikkes = updatedNikkes;
    db.meta.last_updated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

    console.log(`Sanitization complete. Processed ${updatedNikkes.length} Nikkes.`);
}

sanitizeAndSync();
