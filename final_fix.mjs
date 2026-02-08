import fs from 'fs';

const DB_PATH = 'public/data/nikke_db.json';

const CLASS_MAP = {
    'Attacker': '화력형',
    'Defender': '방어형',
    'Supporter': '지원형',
    '화력형(Attacker)': '화력형',
    '방어형(Defender)': '방어형',
    '지원형(Supporter)': '지원형',
    '화력형': '화력형',
    '방어형': '방어형',
    '지원형': '지원형'
};

function finalFix() {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

    let fixCount = 0;
    data.nikkes = data.nikkes.map(n => {
        const oldClass = n.class;
        const newClass = CLASS_MAP[oldClass] || oldClass;

        if (oldClass !== newClass) {
            fixCount++;
            n.class = newClass;
        }

        // 추가로 버스트와 제조사도 한 번 더 체크 (혹시 모르니)
        if (n.burst === 0 || n.burst === '0') n.burst = 'III';
        if (n.company === 0 || n.company === '0') n.company = '엘리시온';

        return n;
    });

    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ 최종 수정 완료! ${fixCount}명의 클래스 명칭을 정규화했습니다.`);
}

finalFix();
