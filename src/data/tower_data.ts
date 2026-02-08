export interface TowerNikke {
    tier: string;
    burst: string;
    role: string;
    name: string;
    alternatives: string[];
    note: string;
}

export interface CorporateTower {
    name: string;
    nikkes: TowerNikke[];
}

export interface AttributeTower {
    name: string;
    code: string;
    nikkes: {
        tier: string;
        role: string;
        name: string;
        alternatives: string[];
        note: string;
    }[];
}

export const CORPORATE_TOWER_DATA: CorporateTower[] = [
    {
        name: "엘리시온",
        nikkes: [
            { tier: "0", burst: "B1", role: "버퍼", name: "리타", alternatives: ["오", "라피"], note: "쿨감·공증·게이지 충전" },
            { tier: "0", burst: "B2", role: "디펜더", name: "센티", alternatives: ["길티", "노벨"], note: "탱킹·버스트 수급" },
            { tier: "0", burst: "B3", role: "딜러", name: "프리바티", alternatives: ["라플라스", "길로틴"], note: "샷건·광역·기절" },
            { tier: "1", burst: "B1", role: "버퍼", name: "베이(갓데스)", alternatives: ["엠마", "앵커"], note: "힐·공증 겸용" },
            { tier: "1", burst: "B2", role: "디펜더", name: "폴리", alternatives: ["폴크방", "디젤"], note: "도발·보호막" },
            { tier: "1", burst: "B3", role: "딜러", name: "라플라스", alternatives: ["메이든", "베스티"], note: "런처·광역 딜" },
            { tier: "2", burst: "B1", role: "힐러", name: "엠마", alternatives: ["밀크", "N102"], note: "힐·버프 조합" },
            { tier: "2", burst: "B2", role: "디펜더", name: "폴크방", alternatives: ["디젤", "은화"], note: "기본 탱커" },
            { tier: "2", burst: "B3", role: "딜러", name: "D", alternatives: ["파워", "하란"], note: "상황별 딜러" }
        ]
    },
    {
        name: "미실리스",
        nikkes: [
            { tier: "0", burst: "B1", role: "버퍼", name: "리타", alternatives: ["오", "볼륨"], note: "쿨감·공증 메인" },
            { tier: "0", burst: "B2", role: "디펜더", name: "나가", alternatives: ["미란다", "아인"], note: "받피증·탱킹" },
            { tier: "0", burst: "B3", role: "딜러", name: "드레이크", alternatives: ["하란", "스노우 화이트"], note: "샷건·광역 딜" },
            { tier: "1", burst: "B1", role: "버퍼", name: "볼륨", alternatives: ["페퍼", "베이(갓데스)"], note: "쿨감·딜 보조" },
            { tier: "1", burst: "B2", role: "디펜더", name: "미란다", alternatives: ["아인", "애드미"], note: "버프·탱킹" },
            { tier: "1", burst: "B3", role: "딜러", name: "하란", alternatives: ["스노우 화이트", "D"], note: "광역·충격" },
            { tier: "2", burst: "B1", role: "버퍼", name: "페퍼", alternatives: ["엠마", "밀크"], note: "힐·보조" },
            { tier: "2", burst: "B2", role: "디펜더", name: "아인", alternatives: ["애드미", "유니"], note: "버프·보호" },
            { tier: "2", burst: "B3", role: "딜러", name: "스노우 화이트", alternatives: ["파워", "베스티"], note: "상황별 딜" }
        ]
    },
    {
        name: "테트라",
        nikkes: [
            { tier: "0", burst: "B1", role: "힐러", name: "라푼젤", alternatives: ["노이즈", "메어리"], note: "힐·부활·생존" },
            { tier: "0", burst: "B2", role: "디펜더", name: "블랑", alternatives: ["누아르", "비스킷"], note: "보호막·버프" },
            { tier: "0", burst: "B3", role: "딜러", name: "앨리스", alternatives: ["모더니아", "슈가"], note: "차지·샷건 딜" },
            { tier: "1", burst: "B1", role: "힐러", name: "노이즈", alternatives: ["메어리", "소다"], note: "힐·버프" },
            { tier: "1", burst: "B2", role: "디펜더", name: "누아르", alternatives: ["비스킷", "디젤"], note: "공격 버프·탱킹" },
            { tier: "1", burst: "B3", role: "딜러", name: "모더니아", alternatives: ["슈가", "솔린"], note: "차지·범용 딜" },
            { tier: "2", burst: "B1", role: "힐러", name: "메어리", alternatives: ["소다", "베시아"], note: "기본 힐" },
            { tier: "2", burst: "B2", role: "디펜더", name: "디젤", alternatives: ["폴크방", "폴리"], note: "추가 탱커" },
            { tier: "2", burst: "B3", role: "딜러", name: "솔린", alternatives: ["에피넬", "율하"], note: "광역 보조" }
        ]
    },
    {
        name: "필그림/오버스펙",
        nikkes: [
            { tier: "0", burst: "B1/B3", role: "버퍼/딜러", name: "라피 : 레드 후드", alternatives: ["크라운", "리틀 머메이드"], note: "올라운더·핵심" },
            { tier: "0", burst: "B2", role: "딜서포터", name: "크라운", alternatives: ["나유타", "리틀 머메이드"], note: "쿨감·버프·받댐증" },
            { tier: "0", burst: "B3", role: "딜러", name: "모더니아", alternatives: ["홍련 : 흑영", "신데렐라"], note: "차지·작열·광역" },
            { tier: "0", burst: "B3", role: "딜러", name: "신데렐라", alternatives: ["모더니아", "홍련 : 흑영"], note: "전격·광역·폭딜" },
            { tier: "0", burst: "B3", role: "딜러", name: "홍련 : 흑영", alternatives: ["홍련", "신데렐라"], note: "풍압·지속딜" },
            { tier: "0", burst: "B1", role: "힐러", name: "라푼젤", alternatives: ["도로시", "리틀 머메이드"], note: "힐·부활·생존" },
            { tier: "0", burst: "B1", role: "버퍼", name: "도로시", alternatives: ["리틀 머메이드", "나유타"], note: "쿨감·받댐증" },
            { tier: "1", burst: "B1", role: "버퍼", name: "리틀 머메이드", alternatives: ["나유타", "노벨"], note: "받댐증·버프" },
            { tier: "1", burst: "B2", role: "딜서포터", name: "나유타", alternatives: ["노벨", "리틀 머메이드"], note: "버충·디버프" },
            { tier: "1", burst: "B3", role: "딜러", name: "미하라 : 본딩 체인", alternatives: ["홍련", "하란"], note: "작열·지속딜" },
            { tier: "1", burst: "B1/B2/B3", role: "딜러", name: "레드 후드", alternatives: ["라피 : 레드 후드", "맥스웰"], note: "철갑·올라운더" },
            { tier: "1", burst: "B2", role: "딜러", name: "그레이브", alternatives: ["크라운", "나유타"], note: "작열·지속딜" },
            { tier: "1", burst: "B3", role: "딜러", name: "홍련", alternatives: ["홍련 : 흑영", "신데렐라"], note: "전격·범용" },
            { tier: "1", burst: "B3", role: "딜러", name: "스노우 화이트", alternatives: ["맥스웰", "신데렐라"], note: "철갑·한방딜" },
            { tier: "1", burst: "B2", role: "디펜더", name: "노아", alternatives: ["크라운", "비스킷"], note: "무적·도발" },
            { tier: "2", burst: "B2", role: "딜러", name: "니힐리스타", alternatives: ["그레이브", "이사벨"], note: "작열·광역" },
            { tier: "2", burst: "B1", role: "디펜더", name: "라푼젤 : 퓨어 그레이스", alternatives: ["라푼젤", "도로시"], note: "철갑·생존" },
            { tier: "2", burst: "B3", role: "딜러", name: "하란", alternatives: ["이사벨", "미하라 : 본딩 체인"], note: "풍압·광역" },
            { tier: "2", burst: "B3", role: "딜러", name: "이사벨", alternatives: ["하란", "노벨"], note: "전격·버스트 단축" }
        ]
    }
];

export const ATTRIBUTE_TOWER_DATA: AttributeTower[] = [
    {
        name: "전격",
        code: "Z.E.U.S",
        nikkes: [
            { tier: "0", role: "1황 딜러", name: "신데렐라", alternatives: ["라피 : 레드 후드", "메이든"], note: "버스트·체력 비례 딜" },
            { tier: "1", role: "버퍼", name: "에이다 웡", alternatives: ["아니스 : 스파클링 서머", "메이든"], note: "딜·버프 겸용" },
            { tier: "2", role: "서브딜", name: "이사벨", alternatives: ["홍련", "아인"], note: "스택형 폭딜" },
            { tier: "3", role: "보조딜", name: "아니스 : 스파클링 서머", alternatives: ["질 발렌타인", "루주"], note: "조건부 딜" },
        ]
    },
    {
        name: "풍압",
        code: "H.E.R.A",
        nikkes: [
            { tier: "0", role: "1황 딜러", name: "홍련 : 흑영", alternatives: ["D : 킬러 와이프", "바니 앨리스"], note: "풍압·지속딜" },
            { tier: "1", role: "버퍼", name: "D : 킬러 와이프", alternatives: ["루주", "바니 앨리스"], note: "쿨감·공증" },
            { tier: "2", role: "서브딜", name: "질 발렌타인", alternatives: ["블랑", "누아르"], note: "안정적 딜링" },
            { tier: "3", role: "보조딜", name: "바니 앨리스", alternatives: ["자칼", "노이즈"], note: "공속·장탄" },
        ]
    },
    {
        name: "철갑",
        code: "P.O.S.E.I.D.O.N",
        nikkes: [
            { tier: "0", role: "1황 딜러", name: "라피 : 레드 후드", alternatives: ["스노우 화이트", "맥스웰"], note: "올라운더·폭딜" },
            { tier: "1", role: "서포터", name: "나유타", alternatives: ["크라운", "리타"], note: "버충·받댐증" },
            { tier: "2", role: "서브딜", name: "스노우 화이트", alternatives: ["맥스웰", "리타"], note: "철갑·한방딜" },
            { tier: "3", role: "보조딜", name: "맥스웰", alternatives: ["리타", "아인"], note: "공증·관통" },
        ]
    },
    {
        name: "작열",
        code: "A.R.E.S",
        nikkes: [
            { tier: "0", role: "1황 딜러", name: "모더니아", alternatives: ["미하라 : 본딩 체인", "앨리스"], note: "광역·작열 딜" },
            { tier: "1", role: "서포터", name: "크라운", alternatives: ["나가", "티아"], note: "받댐증·버프" },
            { tier: "2", role: "서브딜", name: "미하라 : 본딩 체인", alternatives: ["앨리스", "모더니아"], note: "지속 딜링" },
            { tier: "3", role: "보조딜", name: "앨리스", alternatives: ["모더니아", "나가"], note: "차지·폭딜" },
        ]
    },
    {
        name: "수냉",
        code: "A.P.H.R.O.D.I.T.E",
        nikkes: [
            { tier: "0", role: "1황 힐러", name: "라푼젤", alternatives: ["도로시", "리틀 머메이드"], note: "힐·부활·생존" },
            { tier: "1", role: "서포터", name: "도로시", alternatives: ["라푼젤", "수냉 보조"], note: "쿨감·받댐증" },
            { tier: "2", role: "서브딜", name: "리틀 머메이드", alternatives: ["프리바티", "아인"], note: "버프·받댐증" },
            { tier: "3", role: "보조딜", name: "프리바티", alternatives: ["헬름", "길티"], note: "기절·공증" },
        ]
    }
];
