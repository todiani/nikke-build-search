const fs = require('fs');
const db = JSON.parse(fs.readFileSync('public/data/nikke_db.json', 'utf8'));

const updates = {
    "120": `【최적 콘텐츠: 초보자 캠페인 및 솔로 레이드 보조】
- N102는 SR 등급임에도 불구하고 20초의 짧은 버스트 쿨타임과 강력한 아군 전체 공격력 버프를 가진 '보급형 리타'입니다.
- 상세 활용법: 1버스트 서포터가 부족한 초기에 필수적으로 기용됩니다. SSR급 버퍼가 갖추어지기 전까지 모든 캠페인에서 1황 버퍼로 활약하며, 높은 점수를 노리는 솔로 레이드 4~5번 덱에도 편성될 가치가 충분합니다.
- 추천 조합: 어떤 딜러와도 잘 어울리며, 특히 팀 내 메인 딜러의 화력을 10초간 집중시키는 용도로 사용됩니다.`,

    "40": `【최적 콘텐츠: 솔로 레이드(풍압 코드) 및 특정 보스전】
- 아군 전체의 버스트 타임을 연장하고 기절 면역을 부여하는 특수 목적형 딜러/서포터입니다.
- 상세 활용법: 보스의 특정 패턴(기절 등)을 파훼하거나, 버스트 지속 시간이 긴 딜러들의 화력을 극대화할 때 기용됩니다. 풍압 코드 위주의 레이드 파티에서 서브 딜러 겸 유틸 요원으로 활약합니다.
- 추천 조합: 풍압 코드 시너지를 낼 수 있는 니케들이나, 버스트 지속 시간 연장 효과를 잘 받는 고화력 딜러들과 조합합니다.`
};

let updatedCount = 0;
db.nikkes.forEach(n => {
    if (updates[n.id]) {
        n.desc = updates[n.id];
        updatedCount++;
        console.log(`Updated [${n.name}] (ID: ${n.id})`);
    }
});

db.meta.last_updated = new Date().toISOString();
fs.writeFileSync('public/data/nikke_db.json', JSON.stringify(db, null, 2));
console.log(`Successfully updated ${updatedCount} Nikkes.`);
