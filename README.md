# 자판기 시뮬레이터

React + TypeScript로 구현한 자판기 시스템

## 다이어그램

**자판기 동작 메커니즘 다이어그램**: [`docs/vending-machine-flow.drawio`](./docs/vending-machine-flow.drawio)

![다이어그램](./docs/vending-machine-flow.drawio.png)

다이어그램 열람 방법:

- [draw.io](https://app.diagrams.net/)에서 파일 업로드
- VSCode Draw.io 확장 프로그램 설치 후 열람
- 웹 브라우저에서 draw.io → File → Open from → Device

**다이어그램 내용**: 현금/카드 결제 플로우, 예외 처리 분기, 상태 전환 다이어그램

### 다이어그램 관련 문서 참고

- [docs/flow-explain.md](./docs/flow-explain.md)

## 기술 스택

- Frontend: React, TypeScript
- Build Tool: Vite
- State Management: Zustand
- UI Components: shadcn/ui + Radix UI
- Styling: Tailwind CSS
- Icons: Lucide React
- Code Quality: ESLint + TypeScript

## 빠른 시작

### 필수 요구사항

- Node.js 18+
- pnpm (권장 패키지 매니저)

### 설치 및 실행

저장소 클론:

```bash
git clone https://github.com/your-username/wise-vending-machine.git
cd wise-vending-machine
```

패키지 설치:

```bash
pnpm install
```

개발 서버 시작:

```bash
pnpm dev
```

http://localhost:5173 에서 확인

프로덕션 빌드:

```bash
pnpm build
```

빌드 결과 미리보기:

```bash
pnpm preview
```

코드 검사:

```bash
pnpm lint
```

타입 검사:

```bash
pnpm typecheck
```

## 📂 프로젝트 구조

Feature 기반 아키텍처로 도메인별 모듈 분리:

```
src/
├── features/           # 기능별 도메인 분리
│   ├── admin/         # 관리자 기능 (예외 시뮬레이션)
│   ├── machine/       # 자판기 핵심 로직
│   ├── payment/       # 결제 시스템 (현금/카드)
│   └── products/      # 상품 관리
└── shared/            # 공통 컴포넌트 및 유틸리티
    ├── components/ui/ # shadcn/ui 컴포넌트
    └── utils/         # 공통 함수
```

**장점**: 독립적 관리, 확장성, 유지보수성

## 사용 방법

### 기본 구매 방법

#### 현금 결제

1. 결제 방식 선택: "현금" 버튼 클릭
2. 현금 투입: 100원~10,000원 버튼으로 금액 투입
3. 음료 선택: 투입 금액 이상의 음료 버튼 활성화됨
4. 음료 배출: 선택한 음료가 배출구로 나옴
5. 거스름돈 수령: 잔돈이 있으면 자동 반환

#### 카드 결제

1. 결제 방식 선택: "카드" 버튼 클릭
2. 음료 선택: 재고가 있는 음료 버튼 활성화됨
3. 카드 결제 확인: 결제 확인 대화상자에서 승인
4. 결제 완료: 승인 후 음료 자동 배출

## 🚨 구현된 예외 처리 및 엣지 케이스

### 자동 처리되는 예외 상황

| 예외 상황          | 발생 조건                  | 처리 방식      | 사용자 피드백            |
| ------------------ | -------------------------- | -------------- | ------------------------ |
| **잔액 부족**      | 투입 금액 < 음료 가격      | 버튼 비활성화  | 회색 처리된 버튼         |
| **재고 부족**      | 재고 = 0개                 | 버튼 비활성화  | "품절" 표시              |
| **거스름돈 부족**  | 반환할 화폐 부족           | 구매 차단      | 경고 메시지 표시         |
| **화폐 인식 실패** | 빠른 연속 투입             | 화폐 반환      | "화폐 인식 실패" 메시지  |
| **결제 타임아웃**  | 60초(현금)/30초(카드) 경과 | 자동 취소      | 금액 반환                |
| **배출 실패**      | 음료 배출 중 오류          | 차액/재고 복구 | 오류 메시지 및 복구 안내 |

### 관리자 패널 시뮬레이션 가능 예외

관리자 패널을 통해 다음 예외 상황을 인위적으로 발생시킬 수 있습니다:

- **카드 인식 실패**: 카드를 인식하지 못하는 오류 시뮬레이션
- **카드 결제 거부**: 카드 결제 승인이 거부되는 오류 시뮬레이션
- **배출 실패**: 카드 결제 후 음료 배출 과정에서 실패 발생

### 예외 케이스 테스트 방법

#### 1. 거스름돈 부족 테스트

```
1. 10,000원 투입
2. 물(600원) 선택 시도
3. "거스름돈 부족" 메시지 확인 (400원 단위 화폐 부족)
```

#### 2. 화폐 인식 실패 테스트

```
1. 현금 투입 버튼을 빠르게 연속 클릭
2. "화폐 인식 실패" 메시지 확인
3. 투입된 화폐 자동 반환
```

#### 3. 타임아웃 테스트

```
현금: 현금 투입 후 60초 대기 → 자동 반환
카드: 카드 결제 선택 후 30초 대기 → 자동 취소
```

#### 4. 관리자 패널 예외 테스트

```
1. 화면 우측 "🔧 관리자 패널" 열기
2. 원하는 예외 상황 토글 활성화
3. 해당 시나리오 실행하여 예외 처리 확인
```

## 📦 의존성 및 버전 정보

### 주요 패키지 버전

| 패키지           | 버전    | 용도                           |
| ---------------- | ------- | ------------------------------ |
| **React**        | 19.1.1  | UI 프레임워크                  |
| **TypeScript**   | 5.8.3   | 타입 시스템                    |
| **Vite**         | 7.1.2   | 빌드 도구 및 개발 서버         |
| **Zustand**      | 5.0.8   | 경량 상태 관리 라이브러리      |
| **Tailwind CSS** | 4.1.13  | 유틸리티 우선 CSS 프레임워크   |
| **Radix UI**     | ^1.1.12 | shadcn/ui 기반 접근성 컴포넌트 |
| **Lucide React** | 0.542.0 | 아이콘 라이브러리              |
| **ESLint**       | 9.33.0  | 코드 품질 도구                 |

### 개발 도구 및 유틸리티

| 패키지                       | 버전  | 용도                           |
| ---------------------------- | ----- | ------------------------------ |
| **@vitejs/plugin-react-swc** | 4.0.0 | React SWC 플러그인 (빠른 빌드) |
| **class-variance-authority** | 0.7.1 | 조건부 CSS 클래스 관리         |
| **clsx**                     | 2.1.1 | 클래스명 조합 유틸리티         |
| **tailwind-merge**           | 3.3.1 | Tailwind 클래스 병합           |
| **next-themes**              | 0.4.6 | 테마 관리 (다크모드)           |
| **sonner**                   | 2.0.7 | 토스트 알림 시스템             |

### 최소 요구사항

- **Node.js**: 18.0+ (권장: 20.0+)
- **pnpm**: 8.0+ (권장 패키지 매니저)
- **브라우저**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### 프로젝트 설정 파일

| 파일                 | 목적                                     |
| -------------------- | ---------------------------------------- |
| `vite.config.ts`     | Vite 빌드 도구 설정 (React SWC 플러그인) |
| `eslint.config.js`   | ESLint 코드 품질 규칙 설정               |
| `tsconfig.json`      | TypeScript 프로젝트 루트 설정            |
| `tsconfig.app.json`  | 애플리케이션 코드용 TypeScript 설정      |
| `tsconfig.node.json` | Node.js 환경용 TypeScript 설정           |
| `tailwind.config.js` | Tailwind CSS 설정                        |
| `components.json`    | shadcn/ui 컴포넌트 라이브러리 설정       |
