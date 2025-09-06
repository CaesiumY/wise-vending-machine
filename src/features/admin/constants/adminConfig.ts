// adminConfig.ts - 관리자 패널 설정 상수

// 예외 토글 항목 인터페이스
export interface ExceptionToggleItem {
  key: string;
  label: string;
  description: string;
}

// 예외 토글 항목 정의
export const EXCEPTION_TOGGLES: ExceptionToggleItem[] = [
  // 시스템 예외 (3가지)
  {
    key: 'cardReaderFault',
    label: '카드 인식 실패',
    description: '카드를 인식하지 못합니다',
  },
  {
    key: 'cardPaymentReject',
    label: '카드 결제 거부',
    description: '카드 결제가 승인되지 않습니다',
  },
  {
    key: 'dispenseFaultMode',
    label: '배출 실패',
    description: '음료 배출 과정에서 실패가 발생합니다',
  },
];

