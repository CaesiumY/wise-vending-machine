import type { Nullable, ActionResult } from '@/shared/types/utility.types'
import type { ProductType, Product } from '@/features/products/types/product.types'
import type { PaymentMethod, CashDenomination, TransactionStatus } from '@/features/payment/types/payment.types'

// 자판기 상태 타입
export type VendingStatus = 
  | 'idle'              // 대기 상태
  | 'paymentSelect'     // 결제 방식 선택
  | 'cashInput'         // 현금 투입 중
  | 'cardProcess'       // 카드 처리 중
  | 'productSelect'     // 음료 선택 중
  | 'dispensing'        // 배출 진행 중
  | 'completing'        // 거스름돈 처리 중
  | 'maintenance'       // 점검 모드

// 오류 타입 (시뮬레이션)
export type ErrorType = 
  | 'changeShortage'      // 거스름돈 부족
  | 'outOfStock'          // 재고 부족  
  | 'dispenseFailure'     // 음료 배출 실패
  | 'cardReaderFault'     // 카드 인식 실패 (시뮬레이션)
  | 'cardPaymentReject'   // 카드 결제 거부 (시뮬레이션)

// ===== 핵심 타입 정의 =====

// 거스름돈 계산 결과
export interface ChangeBreakdown {
  canProvideChange: boolean
  totalChange: number
  breakdown: { [K in CashDenomination]: number }
  shortage?: CashDenomination[]
  remainingAmount?: number
}


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
}

// 자판기 상태 타입 (state만)
export interface VendingState {
  // 기본 상태
  products: Record<ProductType, Product>
  currentBalance: number
  selectedProduct: Nullable<ProductType>
  paymentMethod: Nullable<PaymentMethod>
  status: VendingStatus
  
  // 카드 결제 관련
  selectedProductForCard: Nullable<ProductType>
  showPaymentConfirm: boolean
  
  // 현금 투입 관련
  insertedCash: CashDenomination[]
  lastInsertTime: number
  
  // 거래 기록
  lastTransaction: Nullable<Transaction>
  
  // UI 상태
  currentError: Nullable<ErrorType>
  errorMessage: string
  isLoading: boolean
}

// 자판기 액션 타입 (actions만)
export interface VendingActions {
  
  // 상품 관리
  selectProduct: (productId: ProductType) => ActionResult
  updateProductStock: (productId: ProductType, newStock: number) => void
  
  // 결제 관리
  setPaymentMethod: (method: PaymentMethod) => ActionResult
  resetPaymentMethod: () => ActionResult
  
  // 현금 관리
  insertCash: (denomination: CashDenomination) => ActionResult
  
  // 카드 결제
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

// 슬라이스 타입 임포트 (새로운 구조)
import type { PaymentSlice } from '../store/slices/paymentSlice'
import type { ProductSlice } from '../store/slices/productSlice'
import type { TransactionSlice } from '../store/slices/transactionSlice'
import type { UiSlice } from '../store/slices/uiSlice'
import type { CashActions } from '../store/actions/cashActions'
import type { CardActions } from '../store/actions/cardActions'
import type { DispenseActions } from '../store/actions/dispenseActions'

// 새로운 리팩터링된 스토어 타입
export type VendingStore = 
  PaymentSlice & 
  ProductSlice & 
  TransactionSlice & 
  UiSlice &
  CashActions &
  CardActions &
  DispenseActions & {
    // 통합 액션들
    setPaymentMethod: (method: PaymentMethod) => ActionResult
    selectProduct: (productId: ProductType) => ActionResult
    reset: () => void
    resetPaymentMethod: () => ActionResult
    updateStock: (productId: ProductType, change: number) => void
  }

// 기존 호환성을 위한 레거시 타입 (필요시 사용)
export type LegacyVendingStore = VendingState & VendingActions