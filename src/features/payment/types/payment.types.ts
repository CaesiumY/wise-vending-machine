// 결제 관련 기본 타입들
export type PaymentMethod = 'cash' | 'card'
export type CashDenomination = 100 | 500 | 1000 | 5000 | 10000
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled'

// 현금 결제 정보
export interface CashPayment {
  insertedCash: Record<CashDenomination, number>
  totalInserted: number
  validatedAmount: number
  rejectedAmount: number
  rejectedDenominations: CashDenomination[]
}

// 자판기 화폐 보유량 (거스름돈용)
export type CashReserve = Record<CashDenomination, number>

// 결제 검증 결과
export interface PaymentValidationResult {
  isValid: boolean
  canProceed: boolean
  reason?: string
  requiredAmount?: number
  availableChange?: boolean
}