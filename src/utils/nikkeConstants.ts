// 공통 상수 및 정규화 로직
// 이 파일은 프론트엔드와 CLI 도구(Node.js) 모두에서 사용됩니다.

// --- 이름 정규화 로직 ---
/**
 * 니케 이름을 정규화합니다.
 * 1. 괄호와 그 안의 내용 제거 (예: "라피 (레드 후드)" -> "라피")
 * 2. 공백 및 특수문자 제거
 * 3. 소문자 변환
 * 4. 유사 이름 통일 (져 -> 저, 솔져 -> 솔저 등)
 */
export function normalizeName(name: string): string {
    if (!name) return "";
    let normalized = name
        .replace(/[\(（][^)）]*[\)）]/g, "") // 괄호 제거
        .replace(/[^가-힣a-zA-Z0-9]/g, "")    // 특수문자/공백 제거
        .replace(/져/g, "저")                // 져 -> 저 (솔져 -> 솔저)
        .replace(/바스트/g, "프로덕트12")    // 바스트 -> 프로덕트12
        .toLowerCase()
        .trim();
    
    return normalized;
}

// 수치 정규화 로직 (%, +, , 등 제거)
export function normalizeValue(val: string | number): number {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(val.toString().replace(/[%+,]/g, '')) || 0;
}

// 무기 정규화 맵
export const WEAPON_MAP: Record<string, string> = {
    "AR": "소총 (AR)", "소총 (AR)": "소총 (AR)",
    "SR": "저격소총 (SR)", "저격소총 (SR)": "저격소총 (SR)",
    "SG": "샷건 (SG)", "샷건 (SG)": "샷건 (SG)",
    "SMG": "기관단총 (SMG)", "기관단총 (SMG)": "기관단총 (SMG)",
    "RL": "런처 (RL)", "런처 (RL)": "런처 (RL)",
    "MG": "기관총 (MG)", "기관총 (MG)": "기관총 (MG)",
    "RL (캔디 라인)": "런처 (RL)",
    "SMG (인플렉서블)": "기관단총 (SMG)"
};

// 클래스 정규화 맵
export const CLASS_MAP: Record<string, string> = {
    "Attacker": "화력형", "화력형": "화력형",
    "Supporter": "지원형", "지원형": "지원형",
    "Defender": "방어형", "방어형": "방어형",
    "방어형(Defender)": "방어형",
    "지원형(Supporter)": "지원형",
    "화력형(Attacker)": "화력형"
};

// 제조사 정규화 맵
export const COMPANY_MAP: Record<string, string> = {
    "엘리시온": "엘리시온",
    "미실리스": "미실리스",
    "테트라": "테트라",
    "필그림": "필그림",
    "어브노멀": "어브노멀",
    "기업:어브노멀": "어브노멀",
    "기업:엘리시온": "엘리시온",
    "기업:미실리스": "미실리스",
    "기업:테트라": "테트라",
    "기업:필그림": "필그림"
};

// 속성(코드) 정규화 맵
export const CODE_MAP: Record<string, string> = {
    "작열": "작열", "풍압": "풍압", "철갑": "철갑", "전격": "전격", "수냉": "수냉"
};

// 버스트 정규화 맵
export const BURST_MAP: Record<string, string> = {
    "I": "I", "II": "II", "III": "III", "A": "I"
};

// 스쿼드 정규화 맵
export const SQUAD_MAP: Record<string, string> = {
    "앱솔루트 (Absolute)": "앱솔루트",
    "앱솔루트": "앱솔루트",
    "엑소틱 (Exotic)": "엑소틱",
    "이그조틱": "엑소틱",
    "엑소틱": "엑소틱",
    "워드레스 (Wardress)": "워드리스",
    "워드레스": "워드리스",
    "워드리스": "워드리스",
    "리콜 릴리즈": "리콜 & 릴리즈",
    "리콜&릴리즈": "리콜 & 릴리즈",
    "리콜 & 릴리즈": "리콜 & 릴리즈",
    "M.M.R": "M.M.R.",
    "M.M.R.": "M.M.R.",
    "Counters": "카운터스",
    "카운터스": "카운터스",
    "파이오니아": "파이오니어",
    "파이오니어": "파이오니어",
    "프리마돈나": "프리마 돈나",
    "프리마 돈나": "프리마 돈나",
    "올드테일즈": "올드 테일즈",
    "올드 테일즈": "올드 테일즈",
    "세리핌": "세라핌",
    "세라핌": "세라핌",
    "바이스 나이츠": "바이스리터",
    "바이스리터": "바이스리터",
    "메티스": "마티스",
    "마티스": "마티스"
};

export const TIER_TO_STARS: Record<string, number> = {
    "SSS": 5, "SS": 4, "S": 3, "A": 2, "B": 1, "C": 0, "D": 0, "PvP": 3
};

export const PVP_TIERS: Record<string, string> = {
    "자칼": "SSS", "노아": "SSS", "홍련": "SSS", "라푼젤": "SSS", "아니스: 스파클링 서머": "SS", "비스킷": "SS"
};

export const tierOptions = ["SSS", "SS", "S", "A", "B", "C", "D", "PvP"];
export const companyOptions = ["엘리시온", "미실리스", "테트라", "필그림", "어브노멀"];
export const codeOptions = ["작열", "풍압", "철갑", "전격", "수냉"];
export const burstOptions = ["I", "II", "III", "A"];
export const weaponOptions = ["AR", "SR", "SG", "SMG", "RL", "MG"];
export const classOptions = ["화력형", "방어형", "지원형"];
export const rarityOptions = ["SSR", "SR", "R"];
