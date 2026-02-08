const fs = require('fs');
const path = require('path');

const dbPath = 'public/data/nikke_db.json';
const buildsDir = 'public/data/builds';

// 1. Fix nikke_db.json
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.nikkes.forEach(nikke => {
  const code = nikke.code;
  if (nikke.usage_stats) {
    nikke.usage_stats.forEach(stat => {
      if (stat.desc) {
        // Only replace if it contains "우월코드 보스"
        stat.desc = stat.desc.replace(/우월코드 보스/g, `${code}코드 보스`);
      }
    });
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Fixed 우월코드 보스 in nikke_db.json');

// 2. Fix build files
const buildFiles = fs.readdirSync(buildsDir).filter(f => f.endsWith('.json'));

buildFiles.forEach(file => {
  const filePath = path.join(buildsDir, file);
  let build = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const code = build.code;
  
  if (build.usage_stats) {
    build.usage_stats.forEach(stat => {
      if (stat.desc) {
        stat.desc = stat.desc.replace(/우월코드 보스/g, `${code}코드 보스`);
      }
    });
  }
  
  fs.writeFileSync(filePath, JSON.stringify(build, null, 2), 'utf8');
});
console.log('Fixed 우월코드 보스 in build files');
