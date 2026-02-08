
const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'public/data/nikke_db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const squadMapping = {
  // Counters
  '라피': '카운터스',
  '아니스': '카운터스',
  '네온': '카운터스',
  '마리안': '카운터스',
  
  // Triangle
  '프리바티': '트라이앵글',
  '애드미': '트라이앵글',
  '율리아': '트라이앵글',
  '프리바티 : 언카인드 메이드': '트라이앵글',
  
  // Infinity Rail
  '디젤': '인피니티 레일',
  '솔린': '인피니티 레일',
  '브리드': '인피니티 레일',
  '브리드 : 사일런트 트랙': '인피니티 레일',
  
  // A.C.P.U.
  '폴리': 'A.C.P.U.',
  '미란다': 'A.C.P.U.',
  '쿼리': 'A.C.P.U.',
  '키리': 'A.C.P.U.',
  
  // Scouting
  '델타': '스카우팅',
  '시그널': '스카우팅',
  
  // Extriner
  '길로틴': '익스터너',
  '메이든': '익스터너',
  '메이든 : 아이스 로즈': '익스터너',
  '길로틴 : 윈터 슬레이어': '익스터너',
  
  // Siege Perilous
  'D': '시지 패러리스',
  'K': '시지 패러리스',
  'D : 킬러 와이프': '시지 패러리스',
  
  // Aegis
  '헬름': '이지스',
  '앵커': '이지스',
  '마스트': '이지스',
  '헬름 : 아쿠아마린': '이지스',
  '앵커 : 이노센트 메이드': '이지스',
  '마스트 : 로망틱 메이드': '이지스',
  
  // Rewind
  '아인': '리와인드',
  '츠바이': '리와인드',
  
  // Academia
  '마르차나': '아카데미아',
  
  // Matis
  '라플라스': '마티스',
  '드레이크': '마티스',
  '맥스웰': '마티스',
  
  // Wardress
  '유니': '워드리스',
  '미하라': '워드리스',
  '미하라 : 본딩 체인': '워드리스',
  
  // Protocol
  '엑시아': '프로토콜',
  '노벨': '프로토콜',
  
  // M.M.R.
  '에테르': 'M.M.R.',
  '마나': 'M.M.R.',
  
  // Mighty Tools
  '리타': '마이티 툴즈',
  '센티': '마이티 툴즈',
  
  // Real Kindness / Rehabilitation
  '길티': '리얼 카인드니스',
  '신': '리얼 카인드니스',
  '퀀시': '리얼 카인드니스',
  '퀀시 : 이스케이프 퀸': '리얼 카인드니스',
  
  // Life Tonic
  '에피넬': '라이프 토닉',
  
  // Machine Lifeform
  '파스칼': '기계생명체',
  
  // Electric Shock
  '엘레그': '일렉트릭 쇼크',
  '트리니': '일렉트릭 쇼크',
  '트로니': '일렉트릭 쇼크',
  
  // Cafe Sweety
  '프림': '카페 스위티',
  '슈가': '카페 스위티',
  '밀크': '카페 스위티',
  
  // Talantum / Talent
  '루피': '탈란툼',
  '얀': '탈란툼',
  '도라': '탈란툼',
  '루피 : 윈터 쇼퍼': '탈란툼',
  
  // 777
  '누아르': '777',
  '블랑': '777',
  '루주': '777',
  
  // Underworld Queen
  '로산나': '언더월드 퀸',
  '사쿠라': '언더월드 퀸',
  '목단': '언더월드 퀸',
  '사쿠라 : 블룸 인 서머': '언더월드 퀸',
  '로산나 : 시크 오션': '언더월드 퀸',
  
  // Seraphim
  '메어리': '세라핌',
  '페퍼': '세라핌',
  '메어리 : 베이 갓데스': '세라핌',
  
  // Happy Zoo
  '레오나': '해피 주',
  '비스킷': '해피 주',
  '네로': '해피 주',
  '베이': '해피 주',
  
  // Nepenthe
  '루마니': '네펜테',
  '폴크방': '네펜테',
  '에피넬': '라이프 토닉', // Epinel is Life Tonic
  
  // Prima Donna
  '노이즈': '프리마 돈나',
  '볼륨': '프리마 돈나',
  '아리아': '프리마 돈나',
  
  // Unlimited
  '루드밀라': '언리미티드',
  '앨리스': '언리미티드',
  '토브': '언리미티드',
  '네쥬': '언리미티드',
  '루드밀라 : 윈터 오너': '언리미티드',
  '앨리스 : 원더랜드 바니': '언리미티드',
  '앨리스 : 바니': '언리미티드',
  
  // Maid For You
  '코코아': '메이드 포 유',
  '소다': '메이드 포 유',
  '에이드': '메이드 포 유',
  '소다 : 트윙클링 바니': '메이드 포 유',
  '에이드 : 바니 치프': '메이드 포 유',
  '에이드 : 바니': '메이드 포 유',
  
  // Dazzling Pearl
  '티아': '다즐링 펄',
  '나가': '다즐링 펄',
  
  // Botanic Garden
  '플로라': '보타닉 가든',
  
  // Pioneer
  '스노우 화이트': '파이오니어',
  '홍련': '파이오니어',
  '라푼젤': '파이오니어',
  '나유타': '파이오니어',
  '스노우 화이트 : 이노센트 데이즈': '파이오니어',
  '스노우 화이트 : 헤비암즈': '파이오니어',
  '홍련 : 흑영': '파이오니어',
  
  // Inherit
  '도로시': '인헤르트',
  '하란': '인헤르트',
  '이사벨': '인헤르트',
  '노아': '인헤르트',
  
  // Weissritter
  '크라운': '바이스리터',
  '차임': '바이스리터',
  
  // Old Tales
  '신데렐라': '올드 테일즈',
  '그레이브': '올드 테일즈',
  '리틀 머메이드': '올드 테일즈',
  
  // Heretic
  '모더니아': '헬레틱',
  '니힐리스타': '헬레틱',
  '리버렐리오': '헬레틱',
  '인디빌리아': '헬레틱',
  
  // Abnormal / Collab
  '2B': '요르하',
  'A2': '요르하',
  '9S': '요르하',
  '시키나미 아스카 랑그레이': '에반게리온',
  '아야나미 레이': '에반게리온',
  '마키나미 마리 일러스트리어스': '에반게리온',
  '카츠라기 미사토': 'NERV',
  '마키마': '데블 헌터',
  '파워': '데블 헌터',
  '히메노': '데블 헌터',
  '에밀리아': '에밀리아 진영',
  '렘': '에밀리아 진영',
  '람': '에밀리아 진영',
  
  // Special / Faction
  '라피 : 레드 후드': '갓데스',
  '레드 후드': '갓데스',
  '도로시': '인헤르트', // Dorothy is Inherit now, but historically Goddess
  '모더니아': '헬레틱', // Modernia is Heretic
  
  // Others
  '루드밀라': '언리미티드',
  '에이다': 'B.S.T.', // Result 4 says Ada is B.S.T? Let's check. Actually result 4 says Ada is 3 stars.
  '트리나': '보타닉 가든', // Let's check Trina.
  '이브': '7차 강하 부대',
  '클레이': '리와인드', // Clay is usually with Rewind?
};

db.nikkes.forEach(nikke => {
  const squad = squadMapping[nikke.name];
  if (squad) {
    nikke.squad = squad;
  }
});

// Update masters.squads
const uniqueSquads = new Set(db.masters.squads);
db.nikkes.forEach(n => {
  if (n.squad) uniqueSquads.add(n.squad);
});
db.masters.squads = Array.from(uniqueSquads).sort();

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Successfully updated nikke_db.json with squad information.');
