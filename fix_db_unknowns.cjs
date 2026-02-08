const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'public', 'data', 'nikke_db.json');

if (!fs.existsSync(dbPath)) {
    console.error('nikke_db.json not found');
    process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const nikkes = db.nikkes || [];

console.log(`Processing ${nikkes.length} nikkes in DB...`);

let updatedCount = 0;

nikkes.forEach(nikke => {
    let changed = false;

    // Fix role
    if (nikke.role === 'Unknown' || nikke.role === '확인 필요' || !nikke.role) {
        if (nikke.class && nikke.class !== 'Unknown' && nikke.class !== '확인 필요') {
            nikke.role = nikke.class;
            changed = true;
            console.log(`[${nikke.name}] Role fixed to: ${nikke.role}`);
        }
    }

    // Fix usage_stats descriptions
    if (Array.isArray(nikke.usage_stats)) {
        nikke.usage_stats.forEach(stat => {
            if (stat.desc && stat.desc.includes('Unknown코드')) {
                stat.desc = stat.desc.replace(/Unknown코드/g, '우월코드');
                changed = true;
                console.log(`[${nikke.name}] Fixed desc in usage_stats: ${stat.name}`);
            }
        });
    }

    // Fix main desc
    if (nikke.desc && nikke.desc.includes('Unknown코드')) {
        nikke.desc = nikke.desc.replace(/Unknown코드/g, '우월코드');
        changed = true;
        console.log(`[${nikke.name}] Fixed main desc`);
    }

    if (changed) updatedCount++;
});

if (updatedCount > 0) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    console.log(`Successfully updated ${updatedCount} nikke entries in nikke_db.json`);
} else {
    console.log('No updates needed for nikke_db.json');
}
