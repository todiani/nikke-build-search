import fs from 'fs';

const DB_PATH = 'public/data/nikke_db.json';
const BACKUP_PATH = 'backups/nikke_db_2026-01-08T13-21-30-044Z.json';

const CLASS_MAP = {
    'Attacker': '화력형',
    'Defender': '방어형',
    'Supporter': '지원형',
    '화력형': '화력형',
    '방어형': '방어형',
    '지원형': '지원형'
};

const BURST_MAP = {
    '1': 'I', '2': 'II', '3': 'III',
    'I': 'I', 'II': 'II', 'III': 'III', 'A': 'A'
};

const fixNikkeFields = (nikke) => {
    const fixed = { ...nikke };

    // 클래스 정규화
    if (fixed.class && CLASS_MAP[fixed.class]) {
        fixed.class = CLASS_MAP[fixed.class];
    } else if (fixed.class === '0' || fixed.class === 0 || !fixed.class) {
        fixed.class = '화력형'; // 기본값
    }

    // 버스트 정규화
    if (fixed.burst && BURST_MAP[fixed.burst]) {
        fixed.burst = BURST_MAP[fixed.burst];
    } else if (fixed.burst === '0' || fixed.burst === 0 || !fixed.burst) {
        fixed.burst = 'III'; // 기본값
    }

    // 제조사 정규화
    if (fixed.company === '0' || fixed.company === 0 || !fixed.company) {
        fixed.company = '엘리시온';
    }

    return fixed;
};

async function restoreAndNormalize() {
    console.log('🚀 데이터 복구 및 한글화 정규화 시작...');

    try {
        const currentData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        const backupData = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf-8'));

        // 백업 데이터를 기반으로 하되 모든 니케의 필드를 정규화
        const normalizedNikkes = backupData.nikkes.map(fixNikkeFields);
        const backupNames = new Set(normalizedNikkes.map(n => n.name));

        // 현재 깨진 DB에서 신규 니케 추가
        const addedNikkes = currentData.nikkes.filter(n => !backupNames.has(n.name));
        addedNikkes.forEach(n => {
            normalizedNikkes.push(fixNikkeFields(n));
        });

        const finalData = {
            ...currentData,
            nikkes: normalizedNikkes,
            meta: {
                ...currentData.meta,
                version: "1.2-normalized",
                last_updated: new Date().toISOString(),
                restored_and_normalized: true
            }
        };

        fs.writeFileSync(DB_PATH, JSON.stringify(finalData, null, 2), 'utf-8');
        console.log(`✅ 복구 및 정규화 완료! 총 ${normalizedNikkes.length}명의 니케 데이터가 저장되었습니다.`);

    } catch (error) {
        console.error('❌ 작업 실패:', error);
    }
}

restoreAndNormalize();
