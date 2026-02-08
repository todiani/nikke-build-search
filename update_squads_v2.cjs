
const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'public/data/nikke_db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const squadMapping = {
  '신데렐라': '올드 테일즈',
  '그레이브': '올드 테일즈',
  '리틀 머메이드': '올드 테일즈',
  '나유타': '파이오니어',
  '트리나': '보타닉 가든',
  '플로라': '보타닉 가든',
  '에이다': 'B.S.T.',
  '질': 'B.S.T.',
  '클레어': 'B.S.T.',
  '이브': '7차 강하 부대',
  '클레이': '리와인드',
  '팬텀': '베스트 셀러',
  '아르카나': '베스트 셀러',
  '브래디': '쿠킹오일',
  '크러스트': '쿠킹오일',
  '라푼젤 : 퓨어 그레이스': '갓데스',
  '스노우 화이트 : 이노센트 데이즈': '갓데스',
  '홍련 : 흑영': '갓데스',
  '라피 : 레드 후드': '카운터스',
  '마나': 'M.M.R.',
  '쿼리': 'A.C.P.U.',
  '루주': '777'
};

db.nikkes.forEach(nikke => {
  const squad = squadMapping[nikke.name];
  if (squad) {
    nikke.squad = squad;
  }
});

// Update masters.squads to include all unique squads
const uniqueSquads = new Set();
db.nikkes.forEach(n => {
  if (n.squad && n.squad !== '-') {
    uniqueSquads.add(n.squad);
  }
});
db.masters.squads = Array.from(uniqueSquads).sort();

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Successfully updated nikke_db.json with accurate squad information.');
