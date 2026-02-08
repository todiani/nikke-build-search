export interface TotemNikke {
    name: string;
    reason: string;
    alias?: string[];
}

export const TOTEM_NIKKES: TotemNikke[] = [
    { name: '크라운', reason: '상시 공증/받댐증/유틸 (현 메타 최고 토템)' },
    { name: '나유타', reason: '2버 딜포터, 평타 딜 기여 높음' },
    { name: '리틀 머메이드', reason: '상시 받댐증 + 버스트 충전 (1버 최상위)' },
    { name: '리타', reason: '쿨감/공증, 버스트 없이도 상시 버퍼 우수' },
    { name: '루주', reason: '쿨감/공증 세트, 스킬만으로 가치 높음' },
    { name: '토브', reason: '1버 쿨감/속도, 샷건덱 토템' },
    { name: '그레이브', reason: '상시 서브딜 + 공증' },
    { name: '마리', reason: '스킬 중심 방어/공격 버프' },
    { name: '에이다', reason: '전격 덱 핵심 버퍼 (상시 공증)' },
    { name: '마스트', alias: ['마스트 로망틱 메이드'], reason: '코드별 서브 버퍼, 보호막 시너지' },
    { name: '누아르', reason: '상시 공증/장탄수 (3버 토템)' },
    { name: '블랑', reason: '보호막/방어 (누블랑 세트)' },
    { name: '프리바티', reason: '평타 공증/재장전 (토템 버퍼)' },
    { name: '맥스웰', reason: '고공격력 아군 공증 (1스킬)' },
    { name: '루드밀라: 윈터 오너', alias: ['클루드'], reason: '평타 방깎 (상시 딜 증폭)' },
    { name: '일레그', reason: '딜/버프/토템 (수냉 3버)' },
    { name: '헬름', reason: '평타 힐/버스트 수급' },
    { name: '헬름: 아쿠아마린', alias: ['수헬름', '수로시'], reason: '힐/딜 기여 (만능형)' },
    { name: '라푼젤', reason: '평타 힐 (대표 토템 힐러)' },
    { name: '노이즈', reason: '평타 힐/탱킹' },
    { name: '페퍼', reason: '평타 힐 (1버 힐러)' },
    { name: '미란다', reason: '속성별 버프' },
    { name: '율하', alias: ['오하라'], reason: '지속딜 기반 체급 + 버프' }, // Assuming O'Hara -> Yulha
    { name: '모더니아', reason: '평타 화력만으로도 강력 (토템 딜러)' },
    { name: '미하라: 본딩', alias: ['미하라(본딩)'], reason: '평타 딜 비중 높음' },
    { name: '메이든', reason: '버스트 없이도 평타 화력 기여' },
    { name: '앤: 미라클 페어리', alias: ['크리스마스 앤'], reason: '부활/버프 (3번 포지션 토템)' },
    { name: '스노우 화이트', reason: '특정 세팅 시 토템 딜러 가능' },
    { name: '트로니', alias: ['크로티'], reason: '토템 가능 (버스트가 더 좋으나 후보군)' }, // Assuming Croti -> Trony
    { name: '드레이크', reason: '상시 공증/명중 (작열 외 토템 가능)' },
];
