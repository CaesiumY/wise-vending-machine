import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { 
  VendingStore, 
  ProductType, 
  PaymentMethod, 
  CashDenomination, 
  Transaction, 
  ChangeBreakdown,
  ErrorType,
  ActionResult
} from '@/types'
import { PRODUCTS } from '@/constants/products'
import { calculateOptimalChange } from '@/utils/changeCalculator'
import { useAdminStore } from './adminStore'

// 초기 상태
const initialState = {
  // 기본 상태
  products: PRODUCTS,
  currentBalance: 0,
  selectedProduct: null,
  paymentMethod: null,
  status: 'idle' as const,
  isOperational: true,
  
  // 거래 관련
  lastTransaction: null,
  transactionHistory: [],
  
  // UI 상태
  dialog: { isOpen: false, type: 'info' as const, title: '', message: '' },
  currentError: null,
  errorMessage: '',
  
  // 타이머 관련
  timeoutId: null,
  operationStartTime: null,
}

export const useVendingStore = create<VendingStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ===== 기본 액션 =====
      
      setPaymentMethod: (method: PaymentMethod): ActionResult => {
        const { status } = get()
        
        // 대기 상태에서만 결제 방식 선택 가능
        if (status !== 'idle') {
          return { success: false, error: '결제 방식을 선택할 수 없는 상태입니다.' }
        }
        
        set({
          paymentMethod: method,
          status: method === 'cash' ? 'cash_input' : 'card_process',
        })
        
        return { success: true }
      },

      selectProduct: (productId: ProductType): ActionResult => {
        const { status, currentBalance, products, paymentMethod } = get()
        
        // 음료 선택 가능한 상태인지 확인
        if (status !== 'product_select' && status !== 'card_process') {
          return { success: false, error: '음료를 선택할 수 없는 상태입니다.' }
        }
        
        const product = products[productId]
        if (!product) {
          return { success: false, error: '존재하지 않는 상품입니다.' }
        }
        
        // 관리자 설정에 따른 재고 레벨 확인
        const adminState = useAdminStore.getState()
        const adminStockLevel = adminState.stockLevels[productId]
        
        // 재고 확인 (관리자 설정 기준)
        if (product.stock <= 0 || adminStockLevel <= 0) {
          get().setError('out_of_stock', `${product.name}이(가) 품절되었습니다.`)
          return { success: false, error: `${product.name}이(가) 품절되었습니다.` }
        }
        
        // 현금 결제시 잔액 확인
        if (paymentMethod === 'cash' && currentBalance < product.price) {
          get().setError('change_shortage', `잔액이 부족합니다. (필요: ${product.price}원, 보유: ${currentBalance}원)`)
          return { success: false, error: '잔액이 부족합니다.' }
        }
        
        set({ selectedProduct: productId })
        
        // 결제 방식에 따라 처리 분기
        if (paymentMethod === 'cash') {
          get().processCashTransaction(productId)
        } else {
          get().processCardPayment(product.price)
        }
        
        return { success: true }
      },

      reset: () => {
        // 타이머 정리
        get().clearTimeout()
        set(initialState)
      },

      // ===== 현금 관련 액션 =====
      
      insertCash: (denomination: CashDenomination): ActionResult => {
        const { status, currentBalance } = get()
        
        // 현금 투입 가능 상태 확인
        if (status !== 'cash_input' && status !== 'product_select') {
          return { success: false, error: '현금을 투입할 수 없는 상태입니다.' }
        }
        
        // adminStore 예외 상황 확인
        const adminState = useAdminStore.getState()
        
        // 위조화폐 검사 시뮬레이션
        if (adminState.fakeMoneyDetection && Math.random() < 0.15) {
          get().setError('fake_money_detected', '위조화폐가 감지되었습니다. 화폐를 반환합니다.')
          return { success: false, errorType: 'fake_money_detected' }
        }
        
        // 지폐/동전 걸림 시뮬레이션
        const isBill = denomination >= 1000
        const jamMode = isBill ? adminState.billJamMode : adminState.coinJamMode
        
        if (jamMode && Math.random() < 0.2) {
          const jamType = isBill ? 'bill_jam' : 'coin_jam'
          get().setError(jamType, `${isBill ? '지폐' : '동전'}가 걸렸습니다. 다시 투입해주세요.`)
          return { success: false, errorType: jamType }
        }
        
        // 정상 투입 처리
        const newBalance = currentBalance + denomination
        
        set({
          currentBalance: newBalance,
          status: 'product_select', // 음료 선택 가능 상태로 전환
        })
        
        return { success: true }
      },

      // ===== 카드 관련 액션 =====
      
      processCardPayment: async (_amount: number): Promise<ActionResult> => {
        const { products, selectedProduct } = get()
        
        if (!selectedProduct) {
          return { success: false, error: '선택된 상품이 없습니다.' }
        }
        
        const product = products[selectedProduct]
        
        set({ status: 'card_process' })
        
        try {
          // adminStore 설정 확인
          const adminState = useAdminStore.getState()
          
          // 카드 인식 시뮬레이션
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // 카드 인식 실패 시뮬레이션
          if (adminState.cardReaderFault) {
            throw new Error('card_reader_fault')
          }
          
          // 결제 승인 시뮬레이션
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          // 결제 거부 시뮬레이션
          if (adminState.cardPaymentReject && Math.random() < 0.15) {
            throw new Error('card_payment_reject')
          }
          
          // 결제 성공 - 거래 생성
          const transaction: Transaction = {
            id: Date.now().toString(),
            productId: selectedProduct,
            productName: product.name,
            amount: product.price,
            paymentMethod: 'card',
            change: 0,
            changeBreakdown: { total: 0, denominations: { 100: 0, 500: 0, 1000: 0, 5000: 0, 10000: 0 }, possible: true },
            timestamp: new Date(),
            status: 'pending',
          }
          
          set({
            lastTransaction: transaction,
            status: 'dispensing',
          })
          
          // 배출 처리
          await get().dispenseProduct()
          
          return { success: true }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'unknown_error'
          const errorType = errorMessage as ErrorType
          
          get().setError(errorType, get().getErrorMessage(errorType))
          
          set({
            status: 'product_select', // 재선택 가능
          })
          
          return { success: false, errorType }
        }
      },

      // ===== 배출 관련 액션 =====
      
      dispenseProduct: async (): Promise<ActionResult> => {
        const { selectedProduct, products, lastTransaction } = get()
        
        if (!selectedProduct || !lastTransaction) {
          return { success: false, error: '배출할 상품이 없습니다.' }
        }
        
        set({ status: 'dispensing' })
        
        try {
          // 배출 과정 시뮬레이션 (2초)
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // adminStore 설정에 따른 배출 실패 시뮬레이션
          const adminState = useAdminStore.getState()
          if (adminState.dispenseFaultMode && Math.random() < 0.3) {
            throw new Error('dispense_failure')
          }
          
          // 재고 감소
          const updatedProducts = { ...products }
          updatedProducts[selectedProduct] = {
            ...updatedProducts[selectedProduct],
            stock: updatedProducts[selectedProduct].stock - 1
          }
          
          set({
            products: updatedProducts,
            status: 'completing',
          })
          
          // 거래 완료 처리
          await get().completeTransaction()
          
          return { success: true }
          
        } catch {
          // 배출 실패시 차액 및 재고 복구
          get().setError('dispense_failure', '음료 배출에 실패했습니다. 결제 금액을 환불합니다.')
          
          // 현금 결제인 경우 잔액 복구
          if (lastTransaction.paymentMethod === 'cash') {
            set(state => ({
              currentBalance: state.currentBalance + lastTransaction.amount,
              status: 'product_select',
            }))
          } else {
            // 카드 결제인 경우 취소 처리
            set({ status: 'idle' })
          }
          
          return { success: false, errorType: 'dispense_failure' }
        }
      },

      // ===== 내부 헬퍼 메서드 =====
      
      processCashTransaction: (productId: ProductType) => {
        const { products, currentBalance } = get()
        const product = products[productId]
        
        if (!product) return
        
        // 거스름돈 계산
        const changeAmount = currentBalance - product.price
        const changeResult = calculateOptimalChange(changeAmount)
        
        // adminStore 설정에 따른 거스름돈 부족 체크
        const adminState = useAdminStore.getState()
        const shouldFailChange = adminState.changeShortageMode || !changeResult.possible
        
        if (shouldFailChange) {
          get().setError('change_shortage', '거스름돈이 부족합니다. 정확한 금액을 투입해주세요.')
          return
        }
        
        // 거래 정보 생성
        const transaction: Transaction = {
          id: Date.now().toString(),
          productId: product.id,
          productName: product.name,
          amount: product.price,
          paymentMethod: 'cash',
          change: changeAmount,
          changeBreakdown: changeResult,
          timestamp: new Date(),
          status: 'pending',
        }
        
        set({
          lastTransaction: transaction,
          currentBalance: changeAmount, // 거스름돈만 남김
          status: 'dispensing',
        })
        
        // 배출 시작
        get().dispenseProduct()
      },

      completeTransaction: async (): Promise<ActionResult> => {
        const { lastTransaction, currentBalance } = get()
        
        if (!lastTransaction) {
          return { success: false, error: '완료할 거래가 없습니다.' }
        }
        
        // 거래 완료 메시지 표시
        const changeMessage = lastTransaction.change > 0 
          ? ` 거스름돈 ${lastTransaction.change}원을 받아가세요.` 
          : ''
        
        get().showDialog(
          'success', 
          '구매 완료',
          `${lastTransaction.productName}을(를) 배출했습니다.${changeMessage}`
        )
        
        // 거래 기록에 추가
        set(state => ({
          transactionHistory: [...state.transactionHistory, {
            ...lastTransaction,
            status: 'success'
          }],
          lastTransaction: { ...lastTransaction, status: 'success' }
        }))
        
        // 잔액이 남아있고 최저가 음료(600원) 이상이면 연속 구매 가능
        const minPrice = Math.min(...Object.values(get().products).map(p => p.price))
        if (currentBalance >= minPrice) {
          set({ 
            status: 'product_select',
            selectedProduct: null 
          })
        } else {
          // 잔액 부족시 자동 반환 후 대기 상태
          setTimeout(() => {
            get().reset()
          }, 3000)
        }
        
        return { success: true }
      },

      // ===== 기존 액션들 =====
      
      resetProductSelection: () => set({ selectedProduct: null }),
      
      updateProductStock: (productId, newStock) => {
        const products = { ...get().products }
        if (products[productId]) {
          products[productId] = { ...products[productId], stock: newStock }
          set({ products })
        }
      },
      
      calculateChange: (amount: number): ChangeBreakdown => {
        return calculateOptimalChange(amount)
      },
      
      dispenseCash: (_breakdown: ChangeBreakdown): ActionResult => {
        // 실제로는 하드웨어 제어
        // 여기서는 시뮬레이션
        return { success: true }
      },
      
      cancelTransaction: (): ActionResult => {
        const { currentBalance } = get()
        
        // 현금 반환
        if (currentBalance > 0) {
          get().showDialog('info', '반환 완료', `${currentBalance}원이 반환되었습니다.`)
        }
        
        get().reset()
        return { success: true }
      },
      
      setStatus: (status) => set({ status }),
      
      setError: (errorType: ErrorType, message?: string) => {
        const errorMessage = message || get().getErrorMessage(errorType)
        set({
          currentError: errorType,
          errorMessage: errorMessage,
        })
        
        get().showDialog('error', '오류 발생', errorMessage)
      },
      
      clearError: () => set({ currentError: null, errorMessage: '' }),
      
      showDialog: (type, title, message, data) => set({ 
        dialog: { isOpen: true, type, title, message, data } 
      }),
      
      hideDialog: () => set({ 
        dialog: { isOpen: false, type: 'info', title: '', message: '' } 
      }),
      
      shutdown: () => set({ status: 'maintenance', isOperational: false }),
      
      startTimeout: (duration, callback) => {
        const timeoutId = window.setTimeout(callback, duration * 1000)
        set({ timeoutId, operationStartTime: new Date() })
      },
      
      clearTimeout: () => {
        const { timeoutId } = get()
        if (timeoutId) {
          window.clearTimeout(timeoutId)
          set({ timeoutId: null, operationStartTime: null })
        }
      },
      
      // ===== 유틸리티 메서드 =====
      
      getErrorMessage: (errorType: ErrorType): string => {
        const errorMessages: Record<ErrorType, string> = {
          change_shortage: '거스름돈이 부족합니다. 정확한 금액을 투입해주세요.',
          fake_money_detected: '위조화폐가 감지되었습니다. 화폐를 반환합니다.',
          bill_jam: '지폐가 걸렸습니다. 다시 투입해주세요.',
          coin_jam: '동전이 걸렸습니다. 다시 투입해주세요.',
          out_of_stock: '선택하신 음료가 품절되었습니다.',
          dispense_failure: '음료 배출에 실패했습니다. 잠시 후 다시 시도해주세요.',
          card_reader_fault: '카드를 인식할 수 없습니다. 다시 삽입해주세요.',
          card_payment_reject: '카드 결제가 거부되었습니다. 다른 카드를 사용해주세요.',
          network_error: '네트워크 오류가 발생했습니다. 현금 결제를 이용해주세요.',
          system_maintenance: '시스템 점검 중입니다. 잠시 후 이용해주세요.',
          max_amount_exceeded: '최대 투입 금액을 초과했습니다.',
          timeout_occurred: '시간이 초과되었습니다. 처음부터 다시 시도해주세요.',
          dispense_blocked: '배출구가 막혔습니다. 관리자에게 문의해주세요.',
          temperature_error: '온도 이상으로 서비스가 제한됩니다.',
          power_unstable: '전원이 불안정합니다. 잠시 후 이용해주세요.',
          admin_intervention: '관리자 개입이 필요합니다. 관리자에게 문의해주세요.',
        }
        
        return errorMessages[errorType] || '알 수 없는 오류가 발생했습니다.'
      },
    }),
    {
      name: 'useVendingStore', // Redux DevTools에서 표시될 이름
    }
  )
)