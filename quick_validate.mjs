import fs from 'fs';

const data = JSON.parse(fs.readFileSync('public/data/nikke_db.json', 'utf-8'));

console.log('=== DB 상태 상세 검증 (요약) ===\n');
console.log(`총 니케 수: ${data.nikkes.length}\n`);

const validTiers = ['SSS', 'SS', 'S', 'A', 'B', 'PvP', 'Unranked'];
const validBursts = ['I', 'II', 'III', 'A'];
const validClasses = ['화력형', '방어형', '지원형'];

const issues = {
    company: data.nikkes.filter(n => n.company === '0' || n.company === 0 || !n.company).length,
    tier: data.nikkes.filter(n => !validTiers.includes(n.tier)).length,
    burst: data.nikkes.filter(n => !validBursts.includes(n.burst)).length,
    class: data.nikkes.filter(n => !validClasses.includes(n.class)).length,
};

console.log(`❌ 제조사 문제: ${issues.company}개`);
console.log(`❌ 티어 문제: ${issues.tier}개`);
console.log(`❌ 버스트 문제: ${issues.burst}개`);
console.log(`❌ 클래스 문제: ${issues.class}개`);

// 중복 확인
const nameMap = {};
const idMap = {};
data.nikkes.forEach(n => {
    nameMap[n.name] = (nameMap[n.name] || 0) + 1;
    if (n.id) idMap[n.id] = (idMap[n.id] || 0) + 1;
});

const dupNames = Object.entries(nameMap).filter(([name, count]) => count > 1);
const dupIds = Object.entries(idMap).filter(([id, count]) => count > 1);

console.log(`❌ 중복 이름: ${dupNames.length}개`);
console.log(`❌ 중복 ID: ${dupIds.length}개`);

if (dupIds.length > 0) {
    console.log('\n중복된 ID 목록 (처음 5개):');
    dupIds.slice(0, 5).forEach(([id, count]) => {
        const owners = data.nikkes.filter(n => n.id === id).map(n => n.name);
        console.log(`   - ID: ${id} (${count}번) -> ${owners.join(', ')}`);
    });
}

const total = Object.values(issues).reduce((a, b) => a + b, 0) + dupNames.length + dupIds.length;
console.log(`\n⚠️ 합계 문제 수: ${total}개`);
