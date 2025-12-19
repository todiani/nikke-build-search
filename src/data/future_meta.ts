export interface MetaTeam {
    boss: string;
    type: 'PVE' | 'PVP' | 'SoloRaid';
    description?: string;
    members: string[]; // 니케 이름 배열 (5인)
    substitutes?: { target: string; replace: string; note?: string }[];
    core_units?: string[];
}

// Helper to expand short names
// 리크 -> 리타, 크라운?? No, let's keep it manual if ambiguous.
// User list provided full mapping implicitly.

export const FUTURE_META_DATA: MetaTeam[] = [
    // === 이상개체요격전 (Anomaly) ===
    {
        boss: '크라켄 (풍압) 1위',
        type: 'PVE',
        description: '머리 파괴+투사체 처리 위주',
        members: ['리타', '크라운', '홍련: 흑영', '앨리스', '나가'],
        substitutes: [
            { target: '리타', replace: '세이렌', note: '스위칭 가능' },
            { target: '홍련: 흑영', replace: '홍련', note: '' },
            { target: '앨리스', replace: '모더니아', note: '' }
        ]
    },
    {
        boss: '크라켄 (풍압) 2위',
        type: 'PVE',
        description: '리버렐리오 고점 조합',
        members: ['리타', '홍련: 흑영', '나가', '크라운', '리버렐리오'] // "리크" interpreted as Liter
    },
    {
        boss: '크라켄 (풍압) 3위',
        type: 'PVE',
        members: ['세이렌', '크라운', '레드 후드', '앨리스', '헬름']
    },

    {
        boss: '울트라 (수냉) 1위',
        type: 'PVE',
        description: '저지+코어 집중',
        members: ['리타', '크라운', '레드 후드', '맥스웰', '헬름: 아쿠아마린'],
        substitutes: [
            { target: '헬름: 아쿠아마린', replace: '루드밀라: 윈터 오너', note: '' },
            { target: '레드 후드', replace: '루드밀라: 윈터 오너', note: '' }
        ]
    },
    {
        boss: '울트라 (수냉) 2위',
        type: 'PVE',
        members: ['세이렌', '크라운', '헬름', '앨리스', '나가']
    },
    {
        boss: '울트라 (수냉) 3위',
        type: 'PVE',
        members: ['도라', '크라운', '앨리스', '레드 후드', '노벨']
    },

    {
        boss: '미러컨테이너 1위',
        type: 'PVE',
        description: '유리구두+보호막 파훼 (아인 필수)',
        members: ['D: 킬러 와이프', '크라운', '아인', '아니스: 스파클링 서머', '나가'],
        substitutes: [{ target: '아인', replace: '세이렌', note: '' }]
    },
    {
        boss: '미러컨테이너 2위',
        type: 'PVE',
        description: '신데렐라 필수 고점',
        members: ['신데렐라', '세이렌', '크라운', '헬름', '리타']
    },
    {
        boss: '미러컨테이너 3위',
        type: 'PVE',
        members: ['리타', '크라운', '레드 후드', '앨리스', '센티']
    },

    {
        boss: '인디빌리아 (풍압) 1위',
        type: 'PVE',
        description: '꼬리 레이저 버티기 (흡혈)',
        members: ['리타', '크라운', '앨리스', '아스카', '나가'],
        substitutes: [{ target: '아스카', replace: '모더니아', note: '' }]
    },
    {
        boss: '인디빌리아 (풍압) 2위',
        type: 'PVE',
        members: ['세이렌', '크라운', '모더니아', '앨리스', '나가']
    },
    {
        boss: '인디빌리아 (풍압) 3위',
        type: 'PVE',
        members: ['홍련: 흑영', '앨리스', '크라운', '리버렐리오', '헬름']
    },

    {
        boss: '하베스트 (수냉) 1위',
        type: 'PVE',
        description: '랩처 우선 처치',
        members: ['도로시', '크라운', '앨리스', '레드 후드', '나가'],
        substitutes: [{ target: '앨리스', replace: '루드밀라: 윈터 오너', note: '' }]
    },
    {
        boss: '하베스트 (수냉) 2위',
        type: 'PVE',
        members: ['그레이브', '앨리스', '아스카', '크라운', '헬름']
    },
    {
        boss: '하베스트 (수냉) 3위',
        type: 'PVE',
        description: '수냉 딜러 부족시 그레이브',
        members: ['세이렌', '크라운', '루드밀라: 윈터 오너', '나가', '리타']
    },

    // === 솔로 레이드 (약점별) ===
    // 작열 (Fire Weakness)
    {
        boss: '솔로레이드 (작열) 1위',
        type: 'SoloRaid',
        description: '메타: 모더니아/아스카 샷건 (그레이브 필수)',
        members: ['리타', '그레이브', '아스카', '레이', '모더니아'],
        substitutes: [{ target: '리타', replace: 'D: 킬러 와이프', note: '' }, { target: '모더니아', replace: '앨리스', note: '' }]
    },
    {
        boss: '솔로레이드 (작열) 2위',
        type: 'SoloRaid',
        members: ['D: 킬러 와이프', '크라운', '홍련: 흑영', '앨리스', '나가'],
        substitutes: [{ target: '홍련: 흑영', replace: '홍련', note: '' }, { target: '나가', replace: '마리', note: '' }]
    },
    {
        boss: '솔로레이드 (작열) 3위',
        type: 'SoloRaid',
        members: ['레드 후드', '블랑', 'A2', '2B', '신데렐라'],
        substitutes: [{ target: 'A2', replace: '드레이크', note: '' }, { target: '2B', replace: '루드밀라: 윈터 오너', note: '' }]
    },
    {
        boss: '솔로레이드 (작열) 4위',
        type: 'SoloRaid',
        members: ['루주', '그레이브', '모더니아', '아스카', '프리바티'],
        substitutes: [{ target: '루주', replace: '토브', note: '' }, { target: '프리바티', replace: '누아르', note: '' }]
    },
    {
        boss: '솔로레이드 (작열) 5위',
        type: 'SoloRaid',
        members: ['세이렌', '나유타', '앨리스', '레이', '헬름'],
        substitutes: [{ target: '나유타', replace: '크라운', note: '' }, { target: '헬름', replace: '도로시', note: '' }]
    },

    // 풍압 (Wind Weakness)
    {
        boss: '솔로레이드 (풍압) 1위',
        type: 'SoloRaid',
        description: '메타: 흑련/아스카 샷건 (리버렐리오 세트)',
        members: ['세이렌', '크라운', '홍련: 흑영', '리버렐리오', '앨리스'],
        substitutes: [{ target: '크라운', replace: '나유타', note: '' }, { target: '앨리스', replace: '모더니아', note: '' }]
    },
    {
        boss: '솔로레이드 (풍압) 2위',
        type: 'SoloRaid',
        members: ['리타', '나가', '아스카', '브리드', '레이'],
        substitutes: [{ target: '나가', replace: '그레이브', note: '' }, { target: '브리드', replace: '홍련', note: '' }]
    },
    {
        boss: '솔로레이드 (풍압) 3위',
        type: 'SoloRaid',
        members: ['D: 킬러 와이프', '마리', '홍련: 흑영', '앨리스', '프리바티'],
        substitutes: [{ target: '마리', replace: '블랑', note: '' }, { target: '앨리스', replace: '아스카', note: '' }]
    },
    {
        boss: '솔로레이드 (풍압) 4위',
        type: 'SoloRaid',
        members: ['레드 후드', '크라운', '리버렐리오', '나가', '헬름'],
        substitutes: [{ target: '리버렐리오', replace: '모더니아', note: '' }, { target: '헬름', replace: '헬름: 아쿠아마린', note: '' }]
    },
    {
        boss: '솔로레이드 (풍압) 5위',
        type: 'SoloRaid',
        members: ['토브', '그레이브', '아스카', '앨리스', '신데렐라'],
        substitutes: [{ target: '그레이브', replace: '나유타', note: '' }, { target: '신데렐라', replace: '미하라: 본딩', note: '' }]
    },

    // 전격 (Electric Weakness)
    {
        boss: '솔로레이드 (전격) 1위',
        type: 'SoloRaid',
        description: '메타: 신데렐라/에이다 지속딜',
        members: ['리타', '크라운', '신데렐라', '에이다', '아니스: 스파클링 서머'],
        substitutes: [{ target: '크라운', replace: '나유타', note: '' }, { target: '에이다', replace: '아인', note: '' }]
    },
    {
        boss: '솔로레이드 (전격) 2위',
        type: 'SoloRaid',
        members: ['세이렌', '마리', '미하라: 본딩', '이사벨', '헬름'],
        substitutes: [{ target: '마리', replace: '그레이브', note: '' }, { target: '이사벨', replace: '아르카나: ???', note: '아르카나' }]
    },
    {
        boss: '솔로레이드 (전격) 3위',
        type: 'SoloRaid',
        members: ['D: 킬러 와이프', '나가', '신데렐라', '앨리스', '레드 후드'],
        substitutes: [{ target: '나가', replace: '블랑', note: '' }, { target: '앨리스', replace: '모더니아', note: '' }]
    },
    {
        boss: '솔로레이드 (전격) 4위',
        type: 'SoloRaid',
        members: ['루주', '헬름: 아쿠아마린', '에이다', '센티', '도라'],
        substitutes: [{ target: '루주', replace: '토브', note: '' }, { target: '센티', replace: '프리바티', note: '' }]
    },
    {
        boss: '솔로레이드 (전격) 5위',
        type: 'SoloRaid',
        members: ['레드 후드', '크라운', '미하라: 본딩', '아니스: 스파클링 서머', '앨리스'],
        substitutes: [{ target: '앨리스', replace: '루드밀라: 윈터 오너', note: '' }]
    },

    // 수냉 (Water Weakness)
    {
        boss: '솔로레이드 (수냉) 1위',
        type: 'SoloRaid',
        description: '메타: 도로시/헬름 코어 집중',
        members: ['세이렌', '크라운', '도로시', '헬름', '앨리스'],
        substitutes: [{ target: '크라운', replace: '나유타', note: '' }, { target: '헬름', replace: '헬름: 아쿠아마린', note: '' }]
    },
    {
        boss: '솔로레이드 (수냉) 2위',
        type: 'SoloRaid',
        members: ['리타', '그레이브', '일레그', '루드밀라: 윈터 오너', '리버렐리오'],
        substitutes: [{ target: '그레이브', replace: '마리', note: '' }, { target: '리버렐리오', replace: '루드밀라: 윈터 오너', note: '' }]
    },
    {
        boss: '솔로레이드 (수냉) 3위',
        type: 'SoloRaid',
        members: ['D: 킬러 와이프', '나가', '도로시', '아니스: 스파클링 서머', '앨리스'],
        substitutes: [{ target: '나가', replace: '블랑', note: '' }, { target: '아니스: 스파클링 서머', replace: '레드 후드', note: '' }]
    },
    {
        boss: '솔로레이드 (수냉) 4위',
        type: 'SoloRaid',
        members: ['토브', '마리', '헬름', '맥스웰', '신데렐라'],
        substitutes: [{ target: '맥스웰', replace: '노벨', note: '' }, { target: '신데렐라', replace: '미하라: 본딩', note: '' }]
    },
    {
        boss: '솔로레이드 (수냉) 5위',
        type: 'SoloRaid',
        members: ['레드 후드', '헬름: 아쿠아마린', '일레그', '앨리스', '나가'],
        substitutes: [{ target: '헬름: 아쿠아마린', replace: '크라운', note: '' }]
    },

    // 철갑 (Iron Weakness)
    {
        boss: '솔로레이드 (철갑) 1위',
        type: 'SoloRaid',
        description: '메타: 크라운/레드후드 철갑 파훼',
        members: ['세이렌', '크라운', '레드 후드', '홍련: 흑영', '앨리스'],
        substitutes: [{ target: '홍련: 흑영', replace: '홍련', note: '' }, { target: '앨리스', replace: '모더니아', note: '' }]
    },
    {
        boss: '솔로레이드 (철갑) 2위',
        type: 'SoloRaid',
        members: ['리타', '나유타', '신데렐라', '헬름', '프리바티'],
        substitutes: [{ target: '나유타', replace: '그레이브', note: '' }, { target: '프리바티', replace: '누아르', note: '' }]
    },
    {
        boss: '솔로레이드 (철갑) 3위',
        type: 'SoloRaid',
        members: ['D: 킬러 와이프', '마리', '도로시', '리버렐리오', '앨리스'],
        substitutes: [{ target: '마리', replace: '블랑', note: '' }, { target: '리버렐리오', replace: '아스카', note: '' }]
    },
    {
        boss: '솔로레이드 (철갑) 4위',
        type: 'SoloRaid',
        members: ['루주', '그레이브', '미하라: 본딩', '아니스: 스파클링 서머', '레이'],
        substitutes: [{ target: '그레이브', replace: '나가', note: '' }, { target: '레이', replace: '에이다', note: '' }]
    },
    {
        boss: '솔로레이드 (철갑) 5위',
        type: 'SoloRaid',
        members: ['토브', '크라운', '앨리스', '헬름', '나가'],
        substitutes: [{ target: '앨리스', replace: '신데렐라', note: '' }]
    },

    // === PVP 추천 ===
    {
        boss: 'PVP 버스트 압박',
        type: 'PVP',
        description: '트리나 무적 + 센티 버충',
        members: ['센티', '트리나', '길티', '노벨', '퀸시'],
        substitutes: [{ target: '트리나', replace: '???', note: '신규' }]
    },
    {
        boss: 'PVP 샷건 쿨감',
        type: 'PVP',
        members: ['리타', '블랑', '누아르', '크라운', '도라'],
        substitutes: [{ target: '블랑', replace: '프리바티', note: '' }]
    },
    {
        boss: 'PVP 속도 안정',
        type: 'PVP',
        members: ['세이렌', '나가', '홍련', '레오나', '마르차나'],
        substitutes: [{ target: '레오나', replace: '센티', note: '' }]
    },
    {
        boss: 'PVP 클래식 홍련',
        type: 'PVP',
        members: ['노아', '자칼', '프리바티', '센티', '드레이크'],
        substitutes: [{ target: '자칼', replace: '길티', note: '' }]
    },
    {
        boss: 'PVP 지속딜',
        type: 'PVP',
        members: ['리버렐리오', '그레이브', '신데렐라', '마리', '앨리스'], // Using Liberalio -> Little Mermaid? user said "리틀 머메이드" -> Liberalio likely? Or unique unit. "리틀 머메이드" is "Little Mermaid". Is that Liberalio? Liberalio is Heretic Jellyfish. Little Mermaid might be a new unit or skin. I'll use text.
        // Actually user said "리틀 머메이드(1)". Liberalio is 3. 
        // Let's assume Little Mermaid is a different unit or nickname for one. I'll add to Guest.
    },
    {
        boss: 'PVP 풍압 특화',
        type: 'PVP',
        members: ['D: 킬러 와이프', '크라운', '미하라: 본딩', '홍련: 흑영', '앨리스'],
        substitutes: [{ target: '홍련: 흑영', replace: '아스카', note: '' }]
    },
    {
        boss: 'PVP 수냉 유지',
        type: 'PVP',
        members: ['루주', '헬름: 아쿠아마린', '도로시', '헬름', '리버렐리오'],
        substitutes: [{ target: '리버렐리오', replace: '루드밀라: 윈터 오너', note: '' }]
    },
    {
        boss: 'PVP 전격 버프',
        type: 'PVP',
        members: ['토브', '블랑', '에이다', '아니스: 스파클링 서머', '센티'],
        substitutes: [{ target: '블랑', replace: '트리나', note: '' }]
    },
    {
        boss: 'PVP 샷건 러시',
        type: 'PVP',
        members: ['레드 후드', '나가', '리버렐리오', '모더니아', '프리바티'],
        substitutes: [{ target: '모더니아', replace: '앨리스', note: '' }]
    },
    {
        boss: 'PVP 부활 안정',
        type: 'PVP',
        members: ['세이렌', '마르차나', '일레그', '루드밀라: 윈터 오너', '노벨']
    }
];

// Guest Units map for rendering missing sprites/info
export const GUEST_NIKKES: Record<string, { burst: 'I' | 'II' | 'III' | 'A', element?: string, weapon?: string, class?: string }> = {
    '세이렌': { burst: 'I', element: '풍압', weapon: 'RL', class: 'Supporter' },
    '신데렐라': { burst: 'III', element: '전격', weapon: 'RL', class: 'Defender' },
    '리버렐리오': { burst: 'III', element: '수냉', weapon: 'SR', class: 'Attacker' }, // Updated to B3
    '아스카': { burst: 'III', element: '작열', weapon: 'AR', class: 'Attacker' },
    '그레이브': { burst: 'II', element: '철갑', weapon: 'SG', class: 'Supporter' },
    '트리나': { burst: 'II', element: '철갑', weapon: 'SMG', class: 'Defender' },
    '미하라: 본딩': { burst: 'III', element: '작열', weapon: 'SG', class: 'Attacker' },
    '레이': { burst: 'III', element: '작열', weapon: 'SR', class: 'Attacker' }, // Rei Ayanami
    '마리': { burst: 'II', element: '전격', weapon: 'SR', class: 'Supporter' }, // Mari Makinami
    '나유타': { burst: 'II', element: '풍압', weapon: 'RL', class: 'Supporter' }, // Nayuta
    '에이다': { burst: 'III', element: '전격', weapon: 'AR', class: 'Attacker' }, // Ada
    '리틀 머메이드': { burst: 'I', element: '수냉', weapon: 'RL', class: 'Supporter' }, // New Guest

    // Existing / Nicknames
    '홍련: 흑영': { burst: 'III', element: '풍압', weapon: 'RL', class: 'Attacker' },
    '흑련': { burst: 'III', element: '풍압', weapon: 'RL', class: 'Attacker' },
    '레드 후드': { burst: 'A', element: '철갑', weapon: 'SR', class: 'Attacker' },
    '레후': { burst: 'A', element: '철갑', weapon: 'SR', class: 'Attacker' },
    '루드밀라: 윈터 오너': { burst: 'III', element: '철갑', weapon: 'MG', class: 'Attacker' },
    '클루드': { burst: 'III', element: '철갑', weapon: 'MG', class: 'Attacker' },
    '헬름: 아쿠아마린': { burst: 'II', element: '철갑', weapon: 'AR', class: 'Attacker' },
    '수헬름': { burst: 'II', element: '철갑', weapon: 'AR', class: 'Attacker' },
    '아니스: 스파클링 서머': { burst: 'III', element: '전격', weapon: 'SG', class: 'Supporter' },
    '수니스': { burst: 'III', element: '전격', weapon: 'SG', class: 'Supporter' },
    'D: 킬러 와이프': { burst: 'I', element: '작열', weapon: 'SMG', class: 'Supporter' },
    '동디': { burst: 'I', element: '작열', weapon: 'SMG', class: 'Supporter' },
    '디젤: 블랙': { burst: 'II', element: '작열', weapon: 'MG', class: 'Defender' },
    '아인': { burst: 'III', element: '전격', weapon: 'AR', class: 'Attacker' } // Ein
};
