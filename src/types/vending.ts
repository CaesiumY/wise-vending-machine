import type { 
  ProductType, 
  PaymentMethod, 
  VendingStatus, 
  ErrorType, 
  TransactionStatus, 
  Nullable, 
  DialogType, 
  ActionResult, 
  CashDenomination 
} from './common'

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

// 거스름돈 상세 분석
export interface ChangeBreakdown {
  total: number
  denominations: Record<CashDenomination, number>
  possible: boolean
  shortage?: CashDenomination[]
  remainingAmount?: number
}

// 향상된 거래 정보
export interface Transaction {
  id: string
  productId: ProductType
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

// 대화상자 상태
export interface DialogState {
  isOpen: boolean
  type: DialogType
  title: string
  message: string
  data?: unknown
}

// 자판기 메인 상태
export interface VendingMachineState {
  // 상품 관리
  products: Record<ProductType, Product>
  
  // 결제 상태
  currentBalance: number
  selectedProduct: Nullable<ProductType>
  paymentMethod: Nullable<PaymentMethod>
  
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
  dialog: DialogState
  isLoading: boolean
  
  // 오류 상태
  currentError: Nullable<ErrorType>
  errorMessage: string
  
  // 타이머 관련
  timeoutId: Nullable<number>
  operationStartTime: Nullable<Date>
}

// 자판기 액션 인터페이스
export interface VendingActions {
  // 상품 관리
  selectProduct: (productId: ProductType) => ActionResult
  resetProductSelection: () => void
  updateProductStock: (productId: ProductType, newStock: number) => void
  
  // 결제 관리
  setPaymentMethod: (method: PaymentMethod) => ActionResult
  insertCash: (denomination: CashDenomination) => ActionResult
  processCardPayment: (amount: number) => Promise<ActionResult>
  
  // 거스름돈 처리
  calculateChange: (amount: number) => ChangeBreakdown
  dispenseCash: (breakdown: ChangeBreakdown) => ActionResult
  
  // 음료 배출
  dispenseProduct: () => Promise<ActionResult>
  
  // 거래 관리
  completeTransaction: () => Promise<ActionResult>
  cancelTransaction: () => ActionResult
  
  // 내부 헬퍼 메서드
  processCashTransaction: (productId: ProductType) => void
  getErrorMessage: (errorType: ErrorType) => string
  
  // 시스템 제어
  setStatus: (status: VendingStatus) => void
  setError: (errorType: ErrorType, message?: string) => void
  clearError: () => void
  
  // 대화상자 관리
  showDialog: (type: DialogType, title: string, message: string, data?: unknown) => void
  hideDialog: () => void
  
  // 시스템 초기화
  reset: () => void
  shutdown: () => void
  
  // 타이머 관리
  startTimeout: (duration: number, callback: () => void) => void
  clearTimeout: () => void
}

// Zustand 스토어 통합 타입
export interface VendingStore extends VendingMachineState, VendingActions {}