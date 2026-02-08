# 🛠️ Nikke Build Search 개발 지침 및 아키텍처 원칙 (Development Guide)

이 문서는 프로젝트의 코드 일관성 유지, 버그 방지 및 유지보수 효율성을 위한 핵심 원칙과 기술적 가이드를 담고 있습니다. 모든 수정 사항은 본 가이드를 준수해야 합니다.

---

## 🏗️ 전체 아키텍처 원칙

### 1. Single Source of Truth (데이터 단일화)
- **메인 DB**: `public/data/nikke_db.json`이 모든 니케 정보의 근간입니다.
- **상태 관리**: 웹 앱에서는 `App.tsx`의 `allNikkes` 상태가, Python 앱에서는 `core_state.py`의 `AppState`가 데이터를 총괄합니다.
- **동기화**: 데이터 변경(추가/수정/삭제) 시 즉시 파일에 저장되고 모든 UI 컴포넌트에 즉각 반영되어야 합니다 (`async/await` 패턴 필수).

### 2. 데이터 정합성 (Data Integrity)
- **정규화 필수**: 모든 입력 데이터는 `src/utils/nikkeConstants.ts`의 `normalizeName`, `normalizeValue` 및 각종 `MAP` 객체를 거쳐야 합니다.
- **명칭 통일**: 한국 서버 공식 명칭을 우선하며, 약어(AR, SR 등)는 정해진 정규화 맵을 통해 표준 명칭으로 변환합니다.

### 3. 로직 및 UI 분리
- 복잡한 계산 로직(CP 계산, 시너지 분석 등)은 UI 컴포넌트 내부가 아닌 `utils/` 또는 `core_utils.py`에 독립된 함수로 구현하여 재사용성을 높입니다.

---

## 🎨 코딩 규칙 및 명명 규칙 (Naming Conventions)

### **JavaScript / TypeScript (Frontend & Tools)**
- **변수 및 함수**: `camelCase` (예: `nikkeData`, `calculatePower`)
- **상수**: `SCREAMING_SNAKE_CASE` (예: `COMPANY_MAP`, `DB_PATH`)
- **컴포넌트 파일**: `PascalCase.tsx` (예: `NikkeCard.tsx`)
- **유틸리티 파일**: `camelCase.ts` (예: `nikkeDataManager.ts`)

### **Python (GUI)**
- **변수 및 함수**: `snake_case` (예: `app_state`, `do_calc`)
- **상수**: `SCREAMING_SNAKE_CASE` (예: `OVERLOAD_DATA`)
- **파일명**: `snake_case.py` (예: `tab_calc.py`)

---

## 🛡️ 오버로드 장비 및 빌드 데이터 규칙 (CRITICAL)

### 1. 슬롯 위치 보존 (Slot Preservation)
- 오버로드 옵션은 총 3개의 슬롯을 가집니다.
- **절대 원칙**: 데이터 변환이나 수집 시 슬롯 번호(1, 2, 3)를 반드시 유지해야 합니다. 유효한 옵션이 1번과 3번에만 있다면 2번은 반드시 '옵션없음' 또는 비어있는 상태로 유지되어야 하며, 순서대로 당겨서 1, 2번으로 기록해서는 안 됩니다.

### 2. 단계(Stage)와 수치(Value) 매칭
- 오버로드 옵션은 `type` (옵션 종류)과 `stage` (1~15단계)로 관리합니다.
- 외부 데이터(블라블라 등)의 퍼센트 수치는 `OVERLOAD_DATA` 상수를 참조하여 가장 가까운 단계값으로 역산하여 저장합니다.

---

## 🔄 데이터 워크플로우 (Workflow)

1.  **데이터 추출**: `Tampermonkey 스크립트`가 블라블라링크에서 데이터를 추출하여 JSON/MD 생성.
2.  **데이터 통합**: `tools/merge_tampermonkey_data.js` 또는 Python의 `auto_fill` 로직이 메인 DB와 병합.
3.  **데이터 정제**: `tools/cleanup_nikke_data.js`를 통해 주기적으로 전체 DB의 정규화 상태 점검.
4.  **UI 반영**: `App.tsx` 로드 시 `initializeNikkeData`를 통해 누락된 필드 기본값 채우기 및 정규화 수행.

---

## 📜 파일별 핵심 역할 및 수정 주의사항

- **`src/utils/nikkeConstants.ts`**: 프로젝트 전체의 명칭 표준입니다. 이곳의 맵을 수정하면 모든 데이터 처리 로직에 영향을 주므로 신중히 수정하십시오.
- **`src/utils/calculator.ts` & `python_src/core_utils.py`**: CP 계산 로직의 쌍둥이입니다. 한 쪽의 수식을 수정하면 반드시 다른 쪽도 동일하게 업데이트하여 두 앱 간의 계산 결과가 일치하도록 해야 합니다.
- **`AGENTS.md`**: AI 에이전트가 프로젝트 컨텍스트를 파악하는 지침서입니다. 주요 아키텍처 변경 시 이 문서도 함께 업데이트하십시오.

---

*본 지침은 프로젝트의 안정성을 보장하기 위한 약속입니다. 모든 개발자는 코드 수정 전 이 문서를 숙지하고 원칙을 준수해야 합니다.*
