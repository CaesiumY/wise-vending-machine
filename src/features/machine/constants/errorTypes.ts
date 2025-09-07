/**
 * 에러 타입 상수 정의
 *
 * 실제 발생 가능한 에러만 포함하며, 타입 안전성과 자동완성을 위해
 * const assertion을 사용한 객체로 정의
 */

export const ErrorTypes = {
  // 거래 관련 에러
  CHANGE_SHORTAGE: 'changeShortage', // 거스름돈 부족 (시뮬레이션 가능)
  OUT_OF_STOCK: 'outOfStock', // 품절
  PRODUCT_NOT_FOUND: 'productNotFound', // 상품 없음

  // 기계 동작 에러
  DISPENSE_FAILURE: 'dispenseFailure', // 배출 실패 (관리자 패널 시뮬레이션)
  INVALID_STATE: 'invalidState', // 잘못된 상태

  // 카드 결제 에러
  CARD_READER_FAULT: 'cardReaderFault', // 카드 인식 실패 (관리자 패널 시뮬레이션)
  CARD_PAYMENT_REJECT: 'cardPaymentReject', // 카드 결제 거부 (관리자 패널 시뮬레이션)

  // 현금 투입 에러
  CASH_INSERT_TOO_FAST: 'cashInsertTooFast', // 빠른 현금 투입 (300ms 이내)
} as const;

/**
 * ErrorType 타입 정의 - const assertion으로부터 추론
 */
export type ErrorType = (typeof ErrorTypes)[keyof typeof ErrorTypes];
