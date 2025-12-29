// 공통 상수 및 유틸리티

// 무기 이름 매핑
export const weaponNames: Record<string, string> = {
    'AR': '소총(AR)',
    'SR': '저격소총(SR)',
    'SG': '샷건(SG)',
    'SMG': '기관단총(SMG)',
    'RL': '런처(RL)',
    'MG': '머신건(MG)'
};

// 스쿼드 옵션 (기업별 정리)
export const squadOptions = [
    // 엘리시온
    '앱솔루트 (Absolute)',
    '인피니티 레일',
    'A.C.P.U.',
    '이지스',
    '트라이앵글',
    '세리핌',
    '프로토콜',
    '스카우팅',
    '익스터너',
    '마스터 핸드',
    '달란트',
    '라이프 토닉',
    '리콜 릴리즈',
    'M.M.R',
    '리틀 캐논',
    '리플레이스',
    // 미실리스
    '마이티 툴즈',
    '워드레스 (Wardress)',
    '리얼 카인드니스',
    '엑소틱 (Exotic)',
    '마티스',
    // 테트라
    '카페 스위티',
    '777',
    '언더월드 퀸',
    '메이드 포 유',
    '프리마 돈나',
    '탈란툼',
    // 필그림
    '갓데스',
    '인헤리트',
    '파이오니어',
    // 기타
    '카운터스',
    '언리미티드'
];

// 클래스 이름 매핑
export const classNames: Record<string, string> = {
    'Attacker': '화력형',
    'Supporter': '지원형',
    'Defender': '방어형'
};

// 클래스 한글 설명
export const classDescriptions: Record<string, string> = {
    'Attacker': '화력형(공격)',
    'Defender': '방어형(탱킹)',
    'Supporter': '지원형(버프/힐)'
};

// 코드 색상 매핑 (텍스트용)
export const codeTextColors: Record<string, string> = {
    '작열': 'text-orange-500',
    '풍압': 'text-green-500',
    '철갑': 'text-amber-700',
    '전격': 'text-yellow-400',
    '수냉': 'text-blue-400'
};

// 버스트 색상 매핑
export const burstColors: Record<string, string> = {
    'I': 'text-pink-500',
    'II': 'text-blue-500',
    'III': 'text-red-500',
    'A': 'text-purple-500'
};

// 클래스 색상 매핑
export const classColors: Record<string, string> = {
    'Attacker': 'text-red-400',
    'Supporter': 'text-green-400',
    'Defender': 'text-blue-400'
};

// 제조사 색상 매핑
export const companyColors: Record<string, string> = {
    '엘리시온': 'text-green-600',
    '미실리스': 'text-blue-600',
    '테트라': 'text-pink-600',
    '필그림': 'text-yellow-600',
    '어브노멀': 'text-purple-600'
};

// 무기 색상 매핑
export const weaponColors: Record<string, string> = {
    'AR': 'text-amber-400',
    'SR': 'text-red-400',
    'SG': 'text-blue-400',
    'SMG': 'text-green-400',
    'RL': 'text-purple-400',
    'MG': 'text-orange-400'
};

// 코드 색상 매핑
export const codeColors: Record<string, string> = {
    '작열': 'bg-orange-900/50 text-orange-300 border-orange-700',
    '풍압': 'bg-green-900/50 text-green-300 border-green-700',
    '철갑': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    '전격': 'bg-blue-900/50 text-blue-300 border-blue-700',
    '수냉': 'bg-cyan-900/50 text-cyan-300 border-cyan-700'
};

// 티어 색상 매핑
export const tierColors: Record<string, string> = {
    'SSS': 'text-red-500 border-red-500',
    'SS': 'text-orange-400 border-orange-400',
    'S': 'text-yellow-400 border-yellow-400',
    'A': 'text-green-400 border-green-400',
    'PvP': 'text-purple-400 border-purple-400',
    'Unranked': 'text-gray-400 border-gray-400'
};

// 제조사 옵션
export const companyOptions = ['엘리시온', '미실리스', '테트라', '필그림', '어브노멀'];

// 속성 옵션
export const codeOptions = ['작열', '풍압', '철갑', '전격', '수냉'];

// 티어 옵션
export const tierOptions = ['SSS', 'SS', 'S', 'A', 'PvP', 'Unranked'];

// 희귀도 옵션
export const rarityOptions = ['SSR', 'SR', 'R'];

// 희귀도 색상 매핑
export const rarityColors: Record<string, string> = {
    'SSR': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    'SR': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    'R': 'bg-blue-500/20 text-blue-400 border-blue-500/50'
};

// 버스트 옵션
export const burstOptions = ['I', 'II', 'III'];

// 무기 옵션
export const weaponOptions = ['AR', 'SR', 'SG', 'SMG', 'RL', 'MG'];

// 클래스 옵션
export const classOptions = ['Attacker', 'Supporter', 'Defender'];

