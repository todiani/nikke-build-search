const fs = require('fs');
const dbPath = 'public/data/nikke_db.json';
let content = fs.readFileSync(dbPath, 'utf8');
content = content.replace(/\"Attacker\"/g, '\"화력형\"');
content = content.replace(/\"Unknown\": \{\}/g, '\"화력형\": {}'); // Fix masters.classes if needed
fs.writeFileSync(dbPath, content, 'utf8');
console.log('Fixed Attacker and Unknown in nikke_db.json');
