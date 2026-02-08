import fs from 'fs';
import path from 'path';

const BUILDS_DIR = 'r:/AI/nikke-build-search/public/data/builds';
const DB_PATH = 'r:/AI/nikke-build-search/public/data/nikke_db.json';

function sync() {
    console.log('Syncing skill data from builds to nikke_db.json...');
    
    if (!fs.existsSync(DB_PATH)) {
        console.error('DB file not found');
        return;
    }

    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const buildFiles = fs.readdirSync(BUILDS_DIR).filter(f => f.endsWith('.json'));

    let updateCount = 0;

    for (const file of buildFiles) {
        const buildData = JSON.parse(fs.readFileSync(path.join(BUILDS_DIR, file), 'utf8'));
        
        // Find nikke in DB by name
        const dbNikke = db.nikkes.find(n => n.name === buildData.name);
        
        if (dbNikke && buildData.skills_detail) {
            dbNikke.skills_detail = buildData.skills_detail;
            updateCount++;
        }
    }

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log(`Successfully synced ${updateCount} nikkes.`);
}

sync();
