export const MESSAGES = {
  // 일반 메시지
  WELCOME: '원하시는 음료를 선택해주세요.',
  SELECT_PAYMENT: '결제 방식을 선택해주세요.',
  INSERT_CASH: '현금을 투입해주세요.',
  INSERT_CARD: '카드를 삽입해주세요.',
  PROCESSING: '처리 중입니다...',
  
  // 성공 메시지
  PAYMENT_SUCCESS: '결제가 완료되었습니다.',
  DISPENSE_SUCCESS: '음료가 배출되었습니다.',
  
  // 오류 메시지
  INSUFFICIENT_BALANCE: '잔액이 부족합니다.',
  OUT_OF_STOCK: '품절된 상품입니다.',
  CHANGE_SHORTAGE: '거스름돈이 부족합니다. 정확한 금액을 투입해주세요.',
  FAKE_MONEY_DETECTED: '위조 화폐가 감지되었습니다.',
  DISPENSE_FAILURE: '음료 배출에 실패했습니다.',
  CARD_ERROR: '카드를 읽을 수 없습니다.',
  PAYMENT_DECLINED: '결제가 거부되었습니다.',
  SYSTEM_MAINTENANCE: '현재 점검 중입니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  
  // 관리자 메시지
  ADMIN_MODE: '관리자 모드가 활성화되었습니다.',
  SETTINGS_UPDATED: '설정이 업데이트되었습니다.',
} as const