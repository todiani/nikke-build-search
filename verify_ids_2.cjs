const fs = require('fs');
const db = JSON.parse(fs.readFileSync('public/data/nikke_db.json', 'utf8'));

const targets = ['리타', '도로시', '누아르', '블랑', '나가', '티아', '앨리스', '홍련', '라푼젤'];
const found = {};

db.nikkes.forEach(n => {
    if (targets.some(t => n.name === t)) {
        found[n.name] = n.id;
    }
});

// Specially for some variants
db.nikkes.forEach(n => {
    if (n.name === '홍련') found['홍련'] = n.id;
    if (n.name === '앨리스') found['앨리스'] = n.id;
});

console.log(JSON.stringify(found, null, 2));
