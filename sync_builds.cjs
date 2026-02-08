const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'public', 'data', 'nikke_db.json');
const buildsDir = path.join(__dirname, 'public', 'data', 'builds');

if (!fs.existsSync(dbPath)) {
    console.error('nikke_db.json not found');
    process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const nikkes = db.nikkes || [];

console.log(`Found ${nikkes.length} nikkes in DB.`);

let updatedCount = 0;

nikkes.forEach(nikke => {
    const buildFileName = nikke._buildFile || `${nikke.id}.json`;
    const buildFilePath = path.join(buildsDir, buildFileName);

    if (fs.existsSync(buildFilePath)) {
        try {
            const buildData = JSON.parse(fs.readFileSync(buildFilePath, 'utf8'));
            let changed = false;

            const fieldsToSync = ['class', 'code', 'company', 'burst', 'weapon', 'rarity', 'tier'];
            fieldsToSync.forEach(field => {
                if (nikke[field] && buildData[field] !== nikke[field]) {
                    console.log(`[${nikke.name}] Updating ${field}: ${buildData[field]} -> ${nikke[field]}`);
                    buildData[field] = nikke[field];
                    changed = true;
                }
            });

            // Handle role: if Unknown, use class
            if (buildData.role === 'Unknown' || buildData.role === '확인 필요' || !buildData.role) {
                const newRole = nikke.role || nikke.class;
                if (newRole && newRole !== 'Unknown' && newRole !== '확인 필요') {
                    buildData.role = newRole;
                    changed = true;
                    console.log(`[${nikke.name}] Role set to: ${buildData.role}`);
                }
            }

            // Handle "Unknown코드" in descriptions
            if (buildData.desc && buildData.desc.includes('Unknown코드')) {
                buildData.desc = buildData.desc.replace(/Unknown코드/g, '우월코드');
                changed = true;
                console.log(`[${nikke.name}] Replaced Unknown코드 in desc`);
            }

            if (changed) {
                fs.writeFileSync(buildFilePath, JSON.stringify(buildData, null, 2), 'utf8');
                updatedCount++;
            }
        } catch (e) {
            console.error(`Error processing ${buildFileName}:`, e.message);
        }
    }
});

console.log(`Finished. Updated ${updatedCount} build files.`);
