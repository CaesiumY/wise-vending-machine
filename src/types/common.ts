// 공통 기본 타입들
export type ProductType = 'cola' | 'water' | 'coffee'
export type PaymentMethod = 'cash' | 'card'
export type CashDenomination = 100 | 500 | 1000 | 5000 | 10000

// 자판기 상태 (8개 주요 상태)
export type VendingStatus = 
  | 'idle'              // 대기 상태
  | 'payment_select'    // 결제 방식 선택
  | 'cash_input'        // 현금 투입 중
  | 'card_process'      // 카드 처리 중
  | 'product_select'    // 음료 선택 중
  | 'dispensing'        // 배출 진행 중
  | 'completing'        // 거스름돈 처리 중
  | 'maintenance'       // 점검 모드

// 실제 사용되는 예외 상황 타입
export type ErrorType = 
  | 'change_shortage'      // 거스름돈 부족
  | 'bill_jam'            // 지폐 걸림
  | 'coin_jam'            // 동전 걸림
  | 'out_of_stock'        // 재고 부족
  | 'dispense_failure'    // 배출 실패
  | 'card_reader_fault'   // 카드 리더기 오류
  | 'card_payment_reject' // 카드 결제 거부
  | 'max_amount_exceeded' // 최대 투입 금액 초과
  | 'timeout_occurred'    // 시간 초과

// 거래 상태
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled'

// 카드 상태
export type CardStatus = 'idle' | 'inserted' | 'processing' | 'approved' | 'declined' | 'error'

// 대화상자 타입
export type DialogType = 'success' | 'error' | 'confirm' | 'info'

// 유틸리티 타입들
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Partial<T> = {
  [P in keyof T]?: T[P];
}

// 관리자 프리셋 이름 (5가지)
export type PresetName = 
  | 'normal'          // 정상 작동
  | 'change_shortage' // 거스름돈 부족
  | 'stock_shortage'  // 재고 소진
  | 'system_error'    // 시스템 오류
  | 'worst_case'      // 최악 상황

// 액션 결과 타입
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
  errorType?: ErrorType
}

// 시간 관련 타입
export interface Timestamp {
  created: Date
  updated: Date
}

// 검증 결과 타입
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// 모니터링 정보 타입
export interface MonitoringInfo {
  uptime: number
  errorCount: number
  transactionCount: number
  lastError?: ErrorType
  lastErrorTime?: Date
}