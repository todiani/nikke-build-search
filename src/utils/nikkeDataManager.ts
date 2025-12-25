import type { NikkeData } from '../data/nikkes';
import { BURST_DB } from '../data/burst_db';

// --- Tier to Stars Mapping ---
export const TIER_TO_STARS: Record<string, number> = {
    'SSS': 5, 'SS': 4, 'S': 3, 'A': 2, 'B': 1, 'C': 0, 'Unranked': 1, 'PvP': 4
};

// --- PVP Tier Lookup ---
export const PVP_TIERS: Record<string, string> = {
    '자칼': 'SSS', '비스킷': 'SSS', '노아': 'SSS', '홍련': 'SSS', '에밀리아': 'SSS', '베스티: 텍티컬업': 'SSS', '헬름(애장품)': 'SSS',
    '노이즈': 'SS', '목단': 'SS', '레드후드': 'SS', '레드 후드': 'SS', '슈가': 'SS', '로산나': 'SS', '루마니': 'SS', '아니스': 'SS', '센티': 'SS', '앤: 미라클페어리': 'SS', '블랑': 'SS', '베이': 'SS', '아니스: 스파클링 서머': 'SS', '신데렐라': 'SS', '아인': 'SS', '소다: 바니': 'SS', '리틀머메이드': 'SS', '트리나': 'SS', '에이다': 'SS', '드레이크': 'SS', '솔린: 프로스트 티켓': 'SS',
    '티아': 'S', '페퍼': 'S', '바이퍼': 'S', '마키마': 'S', '마리': 'S', '네로': 'S', '앵커: 이노센트메이드': 'S', '누아르': 'S', '레이(가칭)': 'S', '프리바티: 메이드': 'S', 'A2': 'S', '2B': 'S', '라피: 레드후드': 'S', '사쿠라: 블룸 인 서머': 'S', '킬로': 'S', '키리': 'S', '라푼젤': 'S', '메이든: 아이즈로즈': 'S', '미하라: 본딩체인': 'S', '메이든': 'S', '퀀시: 이스케이프 퀸': 'S', '홍련: 흑영': 'S', '나유타': 'S',
    '리타': 'A', '엠마': 'A', '루드밀라': 'A', '미카: 스노우버디': 'A', '파스칼': 'A', '크라운': 'A', '그레이브': 'A', '폴크방': 'A', '폴리': 'A', '프리바티': 'A', '스노우화이트': 'A', '아스카': 'A', '하란': 'A', '사쿠라': 'A', '파워': 'A', '레이': 'A', '마나': 'A', '에이드: 바니': 'A',
    '도로시': 'B', '앵커': 'B', '미카': 'B', '메어리': 'B', '메어리: 베이갓데스': 'B', '토브': 'B', '츠바이': 'B', '디젤': 'B', '길티': 'B', '마르차나': 'B', '나가': 'B', '로산나: 시크오션': 'B', '브리드': 'B', '라플라스': 'B', '맥스웰': 'B', '모더니아': 'B', '팬텀': 'B', '베스티': 'B', '렘': 'B', '니힐리스타': 'B',
    '앨리스: 바니': 'C', '코코아': 'C', 'D: 킬러와이프': 'C', '엑시아': 'C', '프림': 'C', '미란다': 'C', '루주': 'C', 'N102': 'C', '라푼젤: 퓨어그레이스': 'C', '얀': 'C', '라이': 'C', '애드미': 'C', '클레이': 'C', '일레그': 'C', '플로라': 'C', '마스트': 'C', '퀀시': 'C', '유니': 'C', '길로틴': 'C', '스노우화이트: 이노센트데이즈': 'C', '이사벨': 'C', '율리아': 'C', '미하라': 'C', '트로니': 'C', '율하': 'C', '볼륨': 'C', '노벨': 'C', '크로우': 'C', '벨로타': 'C', '에이드': 'C', '신': 'C', '앨리스': 'C', '델타_닌자': 'C', '질': 'C', '마스트: 로망틱메이드': 'C'
};

/**
 * Ensures a Nikke has all the standard fields for the app.
 * Fills in default Usage Stats and Burst Details if they are missing.
 */
export const initializeNikkeData = (nikke: NikkeData): NikkeData => {
    const updated = { ...nikke };

    // 1. Initialize Usage Stats if missing or incomplete
    const pvpTier = PVP_TIERS[updated.name] || (updated.tier === 'PvP' ? 'SS' : 'B');
    if (!updated.usage_stats || updated.usage_stats.length === 0) {
        updated.usage_stats = [
            { name: '스테이지', stars: TIER_TO_STARS[updated.tier] || 3, desc: '일반 캠페인 및 타워' },
            { name: '이상개체요격전', stars: Math.max(0, (TIER_TO_STARS[updated.tier] || 3) - 1), desc: '특수 개체 보스 공략' },
            { name: '솔로레이드', stars: TIER_TO_STARS[updated.tier] || 3, desc: updated.code ? `${updated.code}코드 보스 특화` : '고득점 핵심 유닛' },
            { name: '유니온레이드', stars: Math.max(0, (TIER_TO_STARS[updated.tier] || 2) - 1), desc: updated.code ? `${updated.code}코드 보스` : '길드 레이드 활용' },
            { name: '타워', stars: TIER_TO_STARS[updated.tier] || 3, desc: '적극 활용 가능' },
            { name: 'PVP', stars: TIER_TO_STARS[pvpTier] || 1, desc: pvpTier === 'SSS' ? '아레나 필수 공무원' : '아레나 활용 가능' }
        ];
    }

    // 2. Initialize Burst Details if missing
    if (!updated.burst_details || Object.keys(updated.burst_details).length === 0) {
        // ... (Keep existing logic)
        const cleanName = updated.name.split('(')[0].trim();
        const burstData = BURST_DB[cleanName] || BURST_DB[updated.name];
        if (burstData) {
            updated.burst_details = burstData;
        } else {
            const stages: ("2RL" | "2_5RL" | "3RL" | "3_5RL" | "4RL")[] = ["2RL", "2_5RL", "3RL", "3_5RL", "4RL"];
            updated.burst_details = {};
            stages.forEach(s => {
                updated.burst_details![s] = { value: 0, hits: "-", bonus: "0%-0%" };
            });
        }
    }

    return updated;
};

// --- API BASED PERSISTENCE ---

let cachedSquads: string[] = [];
let cachedNikkes: NikkeData[] = [];

// Load all data from server
export const loadDB = async () => {
    try {
        const res = await fetch('http://localhost:3001/api/db');
        if (res.ok) {
            const json = await res.json();
            cachedSquads = json.squads || [];
            // initialize nikkes on load?
            cachedNikkes = (json.nikkes || []).map(initializeNikkeData);
            return { squads: cachedSquads, nikkes: cachedNikkes };
        }
    } catch (e) {
        console.error("Failed to load DB", e);
    }
    return { squads: [], nikkes: [] };
};

// Save helper
const saveDB = async () => {
    try {
        const payload = {
            meta: { version: "1.0", last_updated: new Date().toISOString() },
            squads: cachedSquads,
            nikkes: cachedNikkes
        };
        await fetch('http://localhost:3001/api/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log("DB Saved Successfully");
    } catch (e) {
        console.error("Failed to save DB", e);
    }
};

// --- Squad Management ---

export const getSquadOptions = (): string[] => {
    return cachedSquads;
};

// NOTE: Creating specific 'cache setter' to be used by App.tsx if needed
export const setCachedData = (squads: string[], nikkes: NikkeData[]) => {
    cachedSquads = squads;
    cachedNikkes = nikkes;
}

export const addSquad = async (name: string): Promise<string[]> => {
    if (!cachedSquads.includes(name)) {
        cachedSquads = [...cachedSquads, name];
        await saveDB();
    }
    return cachedSquads;
};

export const updateSquad = async (oldName: string, newName: string): Promise<string[]> => {
    const idx = cachedSquads.indexOf(oldName);
    if (idx !== -1 && !cachedSquads.includes(newName)) {
        cachedSquads = [...cachedSquads];
        cachedSquads[idx] = newName;
        await saveDB();
    }
    return cachedSquads;
};

export const deleteSquad = async (name: string): Promise<string[]> => {
    cachedSquads = cachedSquads.filter(s => s !== name);
    await saveDB();
    return cachedSquads;
};

// --- Nikke Management (for direct calls if needed) ---
export const saveNikkes = async (nikkes: NikkeData[]) => {
    cachedNikkes = nikkes;
    await saveDB();
}

