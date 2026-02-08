import fs from 'fs';

const DB_PATH = 'public/data/nikke_db.json';
const HEALTHY_BACKUP = 'backups/nikke_db - 복사본.json';

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

const BURST_MAP = {
    '1': 'I', '2': 'II', '3': 'III',
    'I': 'I', 'II': 'II', 'III': 'III', 'A': 'A'
};

function normalizeNikke(n) {
    if (n.class && CLASS_MAP[n.class]) n.class = CLASS_MAP[n.class];
    if (n.burst && BURST_MAP[n.burst]) n.burst = BURST_MAP[n.burst];
    if (n.company === '0' || n.company === 0 || !n.company) n.company = '엘리시온';
    if (!n.squad || n.squad === '0') n.squad = '-';
    return n;
}

async function finalSquadRestoration() {
    console.log('🔄 스쿼드 정보 전문 복구 시작...');

    try {
        const healthyData = JSON.parse(fs.readFileSync(HEALTHY_BACKUP, 'utf-8'));
        const currentData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

        // 1. 건강한 백업을 기본으로 사용
        const healthyNikkes = healthyData.nikkes.map(normalizeNikke);
        const healthyNames = new Set(healthyNikkes.map(n => n.name));

        // 2. 현재 DB에서 신규 니케 (백업에 없는 것) 추가
        const newNikkes = currentData.nikkes
            .filter(n => !healthyNames.has(n.name))
            .map(normalizeNikke);

        console.log(`건강한 니케: ${healthyNikkes.length}명`);
        console.log(`유지할 신규 니케: ${newNikkes.length}명 (${newNikkes.map(n => n.name).join(', ')})`);

        const finalNikkes = [...healthyNikkes, ...newNikkes];

        // 3. 마스터 스쿼드 목록 갱신
        const allSquads = Array.from(new Set(finalNikkes.map(n => String(n.squad || '-')))).filter(s => s !== '-' && s !== '');
        allSquads.sort((a, b) => String(a).localeCompare(String(b), 'ko'));

        const finalData = {
            ...healthyData, // 마스터 정보 등은 건강한 백업 기준
            nikkes: finalNikkes,
            masters: {
                ...healthyData.masters,
                squads: ['-', ...allSquads]
            },
            meta: {
                ...healthyData.meta,
                version: "1.3-squad-restored",
                last_updated: new Date().toISOString(),
                restored_from: "nikke_db - 복사본.json"
            }
        };

        // 안전 백업
        const safetyBackup = `backups/nikke_db_SQUAD_BEFORE_FIX_${new Date().getTime()}.json`;
        fs.copyFileSync(DB_PATH, safetyBackup);

        fs.writeFileSync(DB_PATH, JSON.stringify(finalData, null, 2), 'utf-8');
        console.log(`✅ 스쿼드 정보 및 DB 복구 완료! 총 ${finalNikkes.length}명.`);
        console.log(`✅ 마스터 스쿼드 목록 수: ${finalData.masters.squads.length}개.`);

    } catch (error) {
        console.error('❌ 복구 실패:', error);
    }
}

finalSquadRestoration();
