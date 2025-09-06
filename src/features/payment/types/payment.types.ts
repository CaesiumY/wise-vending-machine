import type { ActionResult, Nullable, ValidationResult } from '@/shared/types/utility.types'
import type { ErrorType } from '@/features/machine/types/vending.types'
import type { ChangeCalculationResult } from '@/features/machine/types/vending.types'

// 결제 관련 기본 타입들
export type PaymentMethod = 'cash' | 'card'
export type CashDenomination = 100 | 500 | 1000 | 5000 | 10000
export type CardStatus = 'idle' | 'inserted' | 'processing' | 'approved' | 'declined' | 'error'
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled'

// 현금 결제 정보
export interface CashPayment {
  insertedCash: Record<CashDenomination, number>
  totalInserted: number
  validatedAmount: number
  rejectedAmount: number
  rejectedDenominations: CashDenomination[]
}

// 카드 결제 정보
export interface CardPayment {
  cardNumber?: string
  cardType?: 'credit' | 'debit' | 'prepaid'
  issuer?: string
  transactionId?: string
  approvalCode?: string
  networkResponseTime?: number
}

// 현금 보관함 상태 (간소화)
export type CashInventory = Record<CashDenomination, number>

// 결제 상태
export interface PaymentState {
  // 결제 방식
  method: Nullable<PaymentMethod>
  
  // 현금 결제 상태
  cash: CashPayment
  
  // 카드 결제 상태
  card: CardPayment
  cardStatus: CardStatus
  
  // 총 결제 정보
  totalAmount: number
  authorizedAmount: number
  
  // 결제 검증
  isValidated: boolean
  validationErrors: string[]
  
  // 시간 관리
  paymentStartTime: Nullable<Date>
  timeoutDuration: number
  
  // 네트워크 상태
  isOnline: boolean
  networkRetries: number
}

// 결제 검증 규칙
export interface PaymentValidation {
  maxCashAmount: number
  maxSingleDenomination: number
  minCardAmount: number
  maxCardAmount: number
  allowedCardTypes: string[]
  networkTimeout: number
}

// 결제 검증 결과
export interface PaymentValidationResult {
  isValid: boolean
  canProceed: boolean
  reason?: string
  requiredAmount?: number
  availableChange?: boolean
}

// 결제 프로세서 액션
export interface PaymentProcessor {
  // 현금 처리
  validateCash: (denomination: CashDenomination) => ValidationResult
  insertCash: (denomination: CashDenomination) => ActionResult<CashPayment>
  rejectCash: (denomination: CashDenomination, reason: string) => ActionResult
  
  // 카드 처리
  insertCard: () => ActionResult
  validateCard: () => Promise<ActionResult<CardPayment>>
  authorizePayment: (amount: number) => Promise<ActionResult<string>>
  processCardPayment: (amount: number, authCode: string) => Promise<ActionResult>
  cancelCardPayment: (transactionId: string) => Promise<ActionResult>
  
  // 거스름돈 처리
  calculateChange: (paidAmount: number, purchaseAmount: number) => ChangeCalculationResult
  dispenseChange: (calculation: ChangeCalculationResult) => ActionResult
  
  // 결제 관리
  validatePaymentMethod: (method: PaymentMethod, amount: number) => ValidationResult
  completePayment: () => ActionResult
  refundPayment: (amount: number) => ActionResult
  
  // 시스템 관리
  updateCashInventory: (changes: Record<CashDenomination, number>) => void
  checkNetworkStatus: () => Promise<boolean>
  resetPaymentState: () => void
  
  // 오류 처리
  handlePaymentError: (errorType: ErrorType, context?: unknown) => ActionResult
  retryPayment: () => Promise<ActionResult>
}