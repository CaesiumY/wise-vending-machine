// adminConfig.ts - 관리자 패널 설정 상수

// 예외 토글 항목 인터페이스
export interface ExceptionToggleItem {
  key: string;
  label: string;
  description: string;
  category: 'payment' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// 예외 토글 항목 정의
export const EXCEPTION_TOGGLES: ExceptionToggleItem[] = [
  // 결제 예외 (2가지)
  {
    key: 'changeShortageMode',
    label: '거스름돈 부족',
    description: '정확한 금액 투입을 요구합니다',
    category: 'payment',
    severity: 'medium',
  },
  {
    key: 'fakeMoneyDetection',
    label: '위조화폐 감지',
    description: '투입된 화폐를 위조화폐로 판단합니다',
    category: 'payment',
    severity: 'high',
  },
  
  // 시스템 예외 (9가지)
  {
    key: 'dispenseFaultMode',
    label: '배출 실패',
    description: '음료 배출 과정에서 실패가 발생합니다',
    category: 'system',
    severity: 'critical',
  },
  {
    key: 'cardReaderFault',
    label: '카드 인식 실패',
    description: '카드를 인식하지 못합니다',
    category: 'system',
    severity: 'high',
  },
  {
    key: 'cardPaymentReject',
    label: '카드 결제 거부',
    description: '카드 결제가 승인되지 않습니다',
    category: 'system',
    severity: 'medium',
  },
  {
    key: 'networkErrorMode',
    label: '네트워크 오류',
    description: '카드 결제시 네트워크 연결 오류가 발생합니다',
    category: 'system',
    severity: 'high',
  },
  {
    key: 'systemMaintenanceMode',
    label: '시스템 점검',
    description: '전체 시스템을 점검 모드로 전환합니다',
    category: 'system',
    severity: 'critical',
  },
  {
    key: 'dispenseBlockedMode',
    label: '배출구 막힘',
    description: '음료 배출구가 막혀있는 상황을 시뮬레이션합니다',
    category: 'system',
    severity: 'critical',
  },
  {
    key: 'temperatureErrorMode',
    label: '온도 이상',
    description: '자판기 내부 온도 이상으로 서비스가 제한됩니다',
    category: 'system',
    severity: 'medium',
  },
  {
    key: 'powerUnstableMode',
    label: '전원 불안정',
    description: '전력 공급이 불안정한 상황을 시뮬레이션합니다',
    category: 'system',
    severity: 'high',
  },
  {
    key: 'adminInterventionMode',
    label: '관리자 개입 필요',
    description: '관리자의 직접적인 개입이 필요한 상황입니다',
    category: 'system',
    severity: 'critical',
  },
];

// 카테고리별 그룹핑
export const GROUPED_EXCEPTIONS = {
  payment: EXCEPTION_TOGGLES.filter(item => item.category === 'payment'),
  system: EXCEPTION_TOGGLES.filter(item => item.category === 'system'),
};

// 심각도별 색상 매핑
export const SEVERITY_COLORS = {
  low: 'text-blue-600 bg-blue-50 border-blue-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
};

// 카테고리 표시 정보
export const CATEGORY_INFO = {
  payment: {
    label: '결제 예외',
    icon: '💳',
    description: '현금 및 카드 결제와 관련된 오류 상황',
    color: 'bg-blue-500',
  },
  stock: {
    label: '재고 관리',
    icon: '📦',
    description: '음료 재고와 관련된 설정',
    color: 'bg-green-500',
  },
  system: {
    label: '시스템 예외',
    icon: '⚙️',
    description: '자판기 하드웨어 및 시스템 관련 오류',
    color: 'bg-red-500',
  },
};