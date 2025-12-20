# AGENTS.md - Nikke Build Search Project

## 프로젝트 개요
- **기술 스택**: Vite, React, TypeScript, Tailwind CSS
- **목표**: 니케 성능 데이터 관리, 스마트 태그 검색, 팀 빌더 및 정밀 버스트 수급량 시뮬레이션 제공
- **주요 기능**: 니케 상세 정보 조회/편집, AND/OR/NOT 태그 검색, 5인 덱 시너지 분석, RL 단계별 버스트 계산기 그래픽 출력

## 개발 환경 설정
- **설치**: `npm install`
- **실행**: `npm run dev` (Vite 개발 서버)
- **빌드**: `npm run build`
- **데이터 구조**: 모든 데이터는 `public/data/nikke_db.json`을 기반으로 하며, 사용자 수정 사항은 `localStorage`의 `nikke_db_cache` 키에 저장되어 우선권을 가짐

## 데이터 관리 및 최적화 규칙
- **Single Source of Truth**: 모든 니케 데이터는 `App.tsx`의 `allNikkes` 상태가 관리함.
- **초기화 로직**: 데이터를 로드할 때 `src/utils/nikkeDataManager.ts`의 `initializeNikkeData`를 거쳐 누락된 `usage_stats` 및 `burst_details`를 기본값으로 채워 넣음.
- **버스트 데이터**: `burst_details` 구조는 `value(%)`, `hits(범위)`, `bonus(범위)` 필드를 포함하며, 팀 분석 시 이 수치들을 합산함.

## 디렉터리 구조
- `src/components/`: UI 컴포넌트 (`NikkeDetail`, `TeamAnalysis`, `SmartTagSearch` 등)
- `src/data/`: 정적 데이터 및 인터페이스 (`nikkes.ts`, `synergies.ts`, `future_meta.ts` 등)
- `src/utils/`: 공통 로직 (`nikkeConstants.ts`, `nikkeDataManager.ts`, `hangul.ts` 등)
- `public/data/`: 기본 니케 데이터 및 태그 JSON 세트

## 코드 스타일 및 규칙
- **컴포넌트**: 함수형 컴포넌트(Functional Components)와 Hooks 사용.
- **디자인**: 그래픽 요소(버스트 수급량 등)는 원본 게임 이미지를 최대한 재현한 디자인 적용 (색상 코드: `nikke-red`, `green-400`, `orange-500` 등).
- **태그**: `tags.ts`에 정의된 그룹화된 태그 사용 및 스킬 설명에서의 자동 추출 로직 활용.
- **아이콘**: 🗿(토템), ⚡(버스트), ⚔️(팀빌더), 📛(이름) 등 이모지를 적극 활용하여 가독성 증대.

## 보안 및 제한 사항
- **중요**: `src/data/tags.ts`의 기본 태그 그룹 구조는 함부로 수정하지 말 것 (추가만 가능).
- **데이터 보존**: `localStorage` 캐시와 원본 `nikke_db.json` 간의 동기화에 유의할 것.

## 워크플로
- 새로운 니케 추가 시 `DataManager` 또는 상세 페이지의 `편집 모드` 활용.
- 성능 분석(Synergy) 로직 수정 시 `TeamAnalysis.tsx` 내부의 `synergyAnalysis` 수지 및 로직 검토.

---
*이 문서는 에이전트가 프로젝트의 컨텍스트를 즉시 파악하고 일관된 편집을 수행하기 위한 가이드입니다.*
