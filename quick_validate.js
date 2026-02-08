const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/nikke_db.json', 'utf-8'));

console.log('=== DB 상태 빠른 검증 ===\n');
console.log(`총 니케 수: ${data.nikkes.length}\n`);

// 제조사 문제 확인
const badCompany = data.nikkes.filter(n => n.company === '0' || n.company === 0 || !n.company);
console.log(`❌ 제조사 문제: ${badCompany.length}개`);
if (badCompany.length > 0) {
    console.log('   문제 니케 (처음 20개):');
    badCompany.slice(0, 20).forEach(n => {
        console.log(`   - ${n.name}: company='${n.company}'`);
    });
}

// 제조사 분포
const companyDist = {};
data.nikkes.forEach(n => {
    const c = n.company || 'Unknown';
    companyDist[c] = (companyDist[c] || 0) + 1;
});
console.log('\n제조사 분포:');
Object.entries(companyDist).sort((a, b) => b[1] - a[1]).forEach(([c, count]) => {
    console.log(`   ${c}: ${count}명`);
});

// 기타 필드 검증
const validTiers = ['SSS', 'SS', 'S', 'A', 'B', 'PvP', 'Unranked'];
const validBursts = ['I', 'II', 'III', 'A'];
const validClasses = ['화력형', '방어형', '지원형'];

const badTier = data.nikkes.filter(n => !validTiers.includes(n.tier));
const badBurst = data.nikkes.filter(n => !validBursts.includes(n.burst));
const badClass = data.nikkes.filter(n => !validClasses.includes(n.class));

console.log(`\n❌ 티어 문제: ${badTier.length}개`);
if (badTier.length > 0) {
    badTier.slice(0, 10).forEach(n => console.log(`   - ${n.name}: '${n.tier}'`));
}

console.log(`\n❌ 버스트 문제: ${badBurst.length}개`);
if (badBurst.length > 0) {
    badBurst.slice(0, 10).forEach(n => console.log(`   - ${n.name}: '${n.burst}'`));
}

console.log(`\n❌ 클래스 문제: ${badClass.length}개`);
if (badClass.length > 0) {
    badClass.slice(0, 10).forEach(n => console.log(`   - ${n.name}: '${n.class}'`));
}

// 중복 확인
const nameMap = {};
const idMap = {};
data.nikkes.forEach(n => {
    nameMap[n.name] = (nameMap[n.name] || 0) + 1;
    if (n.id) idMap[n.id] = (idMap[n.id] || 0) + 1;
});

const dupNames = Object.entries(nameMap).filter(([name, count]) => count > 1);
const dupIds = Object.entries(idMap).filter(([id, count]) => count > 1);

console.log(`\n❌ 중복 이름: ${dupNames.length}개`);
dupNames.forEach(([name, count]) => console.log(`   - ${name}: ${count}번`));

console.log(`\n❌ 중복 ID: ${dupIds.length}개`);
dupIds.forEach(([id, count]) => console.log(`   - ${id}: ${count}번`));

// 결과 요약
const totalIssues = badCompany.length + badTier.length + badBurst.length + badClass.length + dupNames.length + dupIds.length;
console.log(`\n${'='.repeat(50)}`);
if (totalIssues === 0) {
    console.log('✅ 모든 검증 통과!');
} else {
    console.log(`⚠️  총 ${totalIssues}개의 문제 발견`);
}
console.log('='.repeat(50));
