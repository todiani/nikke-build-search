const fs = require('fs');
const db = JSON.parse(fs.readFileSync('public/data/nikke_db.json', 'utf8'));

const targets = ['크라운', '레드 후드', '모더니아', '홍련 : 흑영', '2B', 'A2'];
const results = [];

db.nikkes.forEach((n, index) => {
    if (targets.some(t => n.name.includes(t))) {
        results.push({
            id: n.id,
            name: n.name,
            desc: n.desc
        });
    }
});

console.log(JSON.stringify(results, null, 2));
