import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'public', 'data', 'nikke_db.json');

// Default squads (copied from nikkeConstants.ts)
const defaultSquads = [
    // 엘리시온
    '앱솔루트 (Absolute)', '인피니티 레일', 'A.C.P.U.', '이지스', '트라이앵글', '세리핌', '프로토콜', '스카우팅', '익스터너', '마스터 핸드', '달란트', '라이프 토닉', '리콜 릴리즈', 'M.M.R', '리틀 캐논', '리플레이스',
    // 미실리스
    '마이티 툴즈', '워드레스 (Wardress)', '리얼 카인드니스', '엑소틱 (Exotic)', '마티스',
    // 테트라
    '카페 스위티', '777', '언더월드 퀸', '메이드 포 유', '프리마 돈나', '탈란툼',
    // 필그림
    '갓데스', '인헤리트', '파이오니어',
    // 기타
    '카운터스', '언리미티드'
];

if (fs.existsSync(DB_PATH)) {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    try {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
            console.log("Detected Array format. Migrating to Object format...");
            const newDB = {
                meta: {
                    version: "1.0",
                    last_updated: new Date().toISOString()
                },
                squads: defaultSquads,
                nikkes: data
            };
            fs.writeFileSync(DB_PATH, JSON.stringify(newDB, null, 2));
            console.log("Migration complete.");
        } else {
            console.log("DB is already in Object format.");
        }
    } catch (e) {
        console.error("Migration failed:", e);
    }
} else {
    console.error("DB file not found.");
}
