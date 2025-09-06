import type { 
  ProductType, 
  PaymentMethod, 
  VendingStatus, 
  ErrorType, 
  TransactionStatus, 
  Nullable, 
  ActionResult, 
  CashDenomination 
} from '@/shared/types/common.types'

// Re-export commonly used types for convenience
export type { 
  ProductType, 
  PaymentMethod, 
  VendingStatus, 
  ErrorType, 
  TransactionStatus, 
  ActionResult, 
  CashDenomination 
} from '@/shared/types/common.types'
import type { CardPayment } from '@/features/payment/types/payment.types'
import type { Product } from '@/features/products/types/product.types'

// 거스름돈 상세 분석 (호환성을 위해 ChangeCalculationResult와 통합)
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

// 거스름돈 계산 결과 (Task 4) - ChangeBreakdown과 동일
export type ChangeCalculationResult = ChangeBreakdown

// 향상된 거래 정보
export interface Transaction {
  id: string
  productId: ProductType | null  // 반환 거래 시 null 허용
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

// 자판기 내부 상태
export interface VendingState {
  // 기본 정보
  products: Record<ProductType, Product>
  currentBalance: number
  selectedProduct: Nullable<ProductType>
  paymentMethod: Nullable<PaymentMethod>
  status: VendingStatus
  isOperational: boolean
  
  // 카드 결제 관련 (통합)
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
}

// 자판기 액션 인터페이스
export interface VendingActions {
  // 상품 관리
  selectProduct: (productId: ProductType) => ActionResult
  updateProductStock: (productId: ProductType, newStock: number) => void
  
  // 결제 관리
  setPaymentMethod: (method: PaymentMethod) => ActionResult
  resetPaymentMethod: () => void
  
  // 현금 관리
  insertCash: (denomination: CashDenomination) => ActionResult
  returnCash: () => ActionResult
  
  // 카드 결제
  setCardInfo: (info: Partial<CardPayment>) => void
  confirmCardPayment: () => Promise<ActionResult>
  cancelCardPayment: () => void
  processCardPayment: (amount: number) => Promise<ActionResult>
  
  // 배출 관리
  dispenseProduct: () => boolean
  dispenseChange: (amount: number) => ActionResult
  
  // 거래 처리
  processCashTransaction: (productId: ProductType) => void
  cancelTransaction: () => ActionResult
  
  // 상태 관리
  setStatus: (status: VendingStatus) => void
  setError: (errorType: ErrorType, message?: string) => void
  clearError: () => void
  reset: () => void
  
  // 거래 관리
  recordTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void
  getTransactionHistory: () => Transaction[]
  clearTransactionHistory: () => void
}

// 자판기 스토어 타입
export interface VendingStore extends VendingState, VendingActions {}

// 자판기 설정
export interface VendingMachineConfig {
  // 제품 설정
  maxProductStock: number
  minProductStock: number
  
  // 결제 설정
  maxCashAmount: number
  maxCardAmount: number
  cashTimeout: number
  cardTimeout: number
  
  // 시스템 설정
  operatingHours: {
    start: string
    end: string
  }
  maintenanceMode: boolean
  enableSounds: boolean
  
  // 예외 처리 설정
  maxRetries: number
  networkTimeout: number
  dispenseTimeout: number
}