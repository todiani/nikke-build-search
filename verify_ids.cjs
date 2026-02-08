const fs = require('fs');
const db = JSON.parse(fs.readFileSync('public/data/nikke_db.json', 'utf8'));

const targets = ['크라운', '레드 후드', '모더니아', '홍련 : 흑영', '2B', 'A2', '레드 후드'];
const found = {};

db.nikkes.forEach(n => {
    if (targets.some(t => n.name.includes(t))) {
        found[n.name] = n.id;
    }
});

console.log(JSON.stringify(found, null, 2));
