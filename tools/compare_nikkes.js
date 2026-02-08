import fs from 'fs';
import path from 'path';
import { normalizeName } from '../src/utils/nikkeConstants.js';

const dbPath = 'public/data/nikke_db.json';
const blablaDir = 'Tampermonkey Script/DATA';

if (!fs.existsSync(dbPath)) {
    console.error('DB file not found');
    process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const dbNikkes = db.nikkes || [];
const dbMap = new Map();
dbNikkes.forEach(n => {
    const norm = normalizeName(n.name);
    dbMap.set(norm, n);
});

const blablaFiles = fs.readdirSync(blablaDir).filter(f => f.endsWith('.json'));
const blablaMap = new Map();
blablaFiles.forEach(f => {
    try {
        const content = JSON.parse(fs.readFileSync(path.join(blablaDir, f), 'utf8'));
        const name = content.meta?.name || content.name; // meta.name 또는 name
        if (!name) {
            console.warn(`No name found in ${f}`);
            return;
        }
        const norm = normalizeName(name);
        blablaMap.set(norm, { fileName: f, name: name, data: content });
    } catch (e) {
        console.error(`Error parsing ${f}:`, e.message);
    }
});

console.log('--- Comparison Results ---');

console.log('\n[Blablalink에만 있는 니케 (DB에 추가 필요)]');
let onlyInBlabla = 0;
blablaMap.forEach((val, key) => {
    if (!dbMap.has(key)) {
        console.log(`- ${val.name} (${val.fileName})`);
        onlyInBlabla++;
    }
});
if (onlyInBlabla === 0) console.log('없음');

console.log('\n[DB에만 있는 니케 (Blablalink 데이터 누락)]');
let onlyInDb = 0;
dbMap.forEach((val, key) => {
    if (!blablaMap.has(key)) {
        console.log(`- ${val.name} (ID: ${val.id})`);
        onlyInDb++;
    }
});
if (onlyInDb === 0) console.log('없음');

// Check for duplicates in DB
const nameCounts = {};
dbNikkes.forEach(n => {
    const norm = normalizeName(n.name);
    nameCounts[norm] = (nameCounts[norm] || 0) + 1;
});
const duplicates = Object.keys(nameCounts).filter(name => nameCounts[name] > 1);
console.log('\n[DB 내 중복된 니케 이름 (정규화 기준)]');
if (duplicates.length === 0) console.log('없음');
else duplicates.forEach(name => {
    const matches = dbNikkes.filter(n => normalizeName(n.name) === name);
    console.log(`- ${name}: ${matches.map(m => m.id).join(', ')}`);
});
