import { create } from 'zustand'
import type { VendingStore } from '@/types'
import { PRODUCTS } from '@/constants/products'

// 임시 기본 구현 - Phase 4에서 완전히 구현될 예정
export const useVendingStore = create<VendingStore>((set, get) => ({
  // VendingMachineState 초기 상태
  products: PRODUCTS,
  currentBalance: 0,
  selectedProduct: null,
  paymentMethod: null,
  status: 'idle',
  isOperational: true,
  lastTransaction: null,
  transactionHistory: [],
  dialog: { isOpen: false, type: 'info', title: '', message: '' },
  currentError: null,
  errorMessage: '',
  timeoutId: null,
  operationStartTime: null,

  // VendingActions 임시 구현
  selectProduct: (_productId) => ({ success: true }),
  resetProductSelection: () => set({ selectedProduct: null }),
  updateProductStock: (productId, newStock) => {
    const products = { ...get().products }
    if (products[productId]) {
      products[productId] = { ...products[productId], stock: newStock }
      set({ products })
    }
  },
  
  setPaymentMethod: (_method) => ({ success: true }),
  insertCash: (_denomination) => ({ success: true }),
  processCardPayment: async (_amount) => ({ success: true }),
  
  calculateChange: (_amount) => ({ 
    total: 0, 
    denominations: { 100: 0, 500: 0, 1000: 0, 5000: 0, 10000: 0 }, 
    possible: true 
  }),
  dispenseCash: (_breakdown) => ({ success: true }),
  
  dispenseProduct: async () => ({ success: true }),
  
  completeTransaction: () => ({ success: true }),
  cancelTransaction: () => ({ success: true }),
  
  setStatus: (status) => set({ status }),
  setError: (errorType, message) => set({ currentError: errorType, errorMessage: message || '' }),
  clearError: () => set({ currentError: null, errorMessage: '' }),
  
  showDialog: (type, title, message, data) => set({ 
    dialog: { isOpen: true, type, title, message, data } 
  }),
  hideDialog: () => set({ 
    dialog: { isOpen: false, type: 'info', title: '', message: '' } 
  }),
  
  reset: () => set({
    currentBalance: 0,
    selectedProduct: null,
    paymentMethod: null,
    status: 'idle',
    currentError: null,
    errorMessage: '',
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
  }
}))