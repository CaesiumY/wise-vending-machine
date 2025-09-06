import type { 
  ProductType, 
  PaymentMethod, 
  VendingStatus, 
  ErrorType, 
  TransactionStatus, 
  Nullable, 
  ActionResult, 
  CashDenomination 
} from './common'
import type { CardPayment } from './payment'

// 상품 정보
export interface Product {
  id: ProductType
  name: string
  price: number
  stock: number
  minStock: number
  maxStock: number
  image?: string
  available: boolean
}

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
  errorType?: ErrorType
  errorMessage?: string
}


// 자판기 메인 상태
export interface VendingMachineState {
  // 상품 관리
  products: Record<ProductType, Product>
  
  // 결제 상태
  currentBalance: number
  selectedProduct: Nullable<ProductType>
  paymentMethod: Nullable<PaymentMethod>
  
  // 카드 결제 관련
  selectedProductForCard: Nullable<ProductType>
  showPaymentConfirm: boolean
  cardInfo: Nullable<CardPayment>
  
  // 현금 투입 관련 (새 추가)
  insertedCash: CashDenomination[]
  lastInsertTime: number
  
  // 시스템 상태
  status: VendingStatus
  isOperational: boolean
  
  // 거래 관리
  lastTransaction: Nullable<Transaction>
  transactionHistory: Transaction[]
  
  // UI 상태
  isLoading: boolean
  
  // 오류 상태
  currentError: Nullable<ErrorType>
  errorMessage: string
  
}

// 자판기 액션 인터페이스
export interface VendingActions {
  // 상품 관리
  selectProduct: (productId: ProductType) => ActionResult
  updateProductStock: (productId: ProductType, newStock: number) => void
  
  // 결제 관리
  setPaymentMethod: (method: PaymentMethod) => ActionResult
  resetPaymentMethod: () => ActionResult
  insertCash: (denomination: CashDenomination) => ActionResult
  processCardPayment: (amount: number) => Promise<ActionResult>
  
  // 카드 결제 관련 (새로 추가)
  selectCardPayment: () => void
  confirmCardPayment: () => Promise<ActionResult>
  cancelCardPayment: () => void
  updateStock: (productId: ProductType, change: number) => void
  
  // 거스름돈 처리
  calculateChange: (amount: number) => ChangeBreakdown
  
  // 음료 배출
  dispenseProduct: () => boolean
  
  // 거래 관리
  cancelTransaction: () => ActionResult
  
  // 내부 헬퍼 메서드
  processCashTransaction: (productId: ProductType) => void
  
  // 시스템 제어
  setStatus: (status: VendingStatus) => void
  setCardInfo: (cardInfo: Nullable<CardPayment>) => void
  setError: (errorType: ErrorType, message?: string) => void
  clearError: () => void
  
  // 시스템 초기화
  reset: () => void
}

// Zustand 스토어 통합 타입
export interface VendingStore extends VendingMachineState, VendingActions {}