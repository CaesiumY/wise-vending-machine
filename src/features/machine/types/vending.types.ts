import type { Nullable, ActionResult } from '@/shared/types/utility.types'
import type { ProductType, Product } from '@/features/products/types/product.types'
import type { PaymentMethod, CashDenomination, TransactionStatus, CardPayment } from '@/features/payment/types/payment.types'

// 자판기 상태 타입
export type VendingStatus = 
  | 'idle'              // 대기 상태
  | 'payment_select'    // 결제 방식 선택
  | 'cash_input'        // 현금 투입 중
  | 'card_process'      // 카드 처리 중
  | 'product_select'    // 음료 선택 중
  | 'dispensing'        // 배출 진행 중
  | 'completing'        // 거스름돈 처리 중
  | 'maintenance'       // 점검 모드

// 오류 타입 (시뮬레이션)
export type ErrorType = 
  | 'change_shortage'      // 거스름돈 부족
  | 'out_of_stock'        // 재고 부족  
  | 'dispense_failure'    // 음료 배출 실패
  | 'card_reader_fault'   // 카드 인식 실패 (시뮬레이션)
  | 'card_payment_reject' // 카드 결제 거부 (시뮬레이션)

// ===== 핵심 타입 정의 =====

// 거스름돈 계산 결과
export interface ChangeBreakdown {
  total: number
  denominations: Record<CashDenomination, number>
  possible: boolean
  shortage?: CashDenomination[]
  remainingAmount?: number
  // 새 필드들 (ChangeCalculationResult 호환)
  canProvideChange: boolean
  totalChange: number
  breakdown: { [K in CashDenomination]: number }
}

// 호환성을 위한 타입 별칭
export type ChangeCalculationResult = ChangeBreakdown

// 거래 정보
export interface Transaction {
  id: string
  productId: ProductType | null
  productName: string
  amount: number
  paymentMethod: PaymentMethod
  change: number
  changeBreakdown?: ChangeBreakdown
  timestamp: Date
  status: TransactionStatus
  cardInfo?: Partial<CardPayment>
  refundReason?: string
  isRefund?: boolean
}

// 자판기 스토어 타입 (상태 + 액션 통합)
export interface VendingStore {
  // ===== 상태 =====
  
  // 기본 상태
  products: Record<ProductType, Product>
  currentBalance: number
  selectedProduct: Nullable<ProductType>
  paymentMethod: Nullable<PaymentMethod>
  status: VendingStatus
  isOperational: boolean
  
  // 카드 결제 관련
  selectedProductForCard: Nullable<ProductType>
  showPaymentConfirm: boolean
  cardInfo: Nullable<Partial<CardPayment>>
  
  // 현금 투입 관련
  insertedCash: CashDenomination[]
  lastInsertTime: number
  
  // 거래 기록
  lastTransaction: Nullable<Transaction>
  transactionHistory: Transaction[]
  
  // UI 상태
  currentError: Nullable<ErrorType>
  errorMessage: string
  isLoading: boolean
  
  // ===== 액션 =====
  
  // 상품 관리
  selectProduct: (productId: ProductType) => ActionResult
  updateProductStock: (productId: ProductType, newStock: number) => void
  
  // 결제 관리
  setPaymentMethod: (method: PaymentMethod) => ActionResult
  resetPaymentMethod: () => ActionResult
  
  // 현금 관리
  insertCash: (denomination: CashDenomination) => ActionResult
  
  // 카드 결제
  setCardInfo: (info: Partial<CardPayment>) => void
  confirmCardPayment: () => Promise<ActionResult>
  cancelCardPayment: () => void
  processCardPayment: (amount: number) => Promise<ActionResult>
  
  // 배출 관리
  dispenseProduct: () => boolean
  
  // 거래 처리
  processCashTransaction: (productId: ProductType) => void
  cancelTransaction: () => ActionResult
  
  // 상태 관리
  setStatus: (status: VendingStatus) => void
  setError: (errorType: ErrorType, message?: string) => void
  clearError: () => void
  reset: () => void
  
  // 유틸리티
  calculateChange: (amount: number) => ChangeBreakdown
  updateStock: (productId: ProductType, change: number) => void
}