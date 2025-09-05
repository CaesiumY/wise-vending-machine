import { create } from 'zustand'
import type { VendingMachineState, PaymentState, ProductType, PaymentMethod, CashDenomination } from '@/types'
import { PRODUCTS } from '@/constants/products'

interface VendingStore extends VendingMachineState, PaymentState {
  // Actions
  selectProduct: (productId: ProductType) => void
  setPaymentMethod: (method: PaymentMethod) => void
  insertCash: (denomination: CashDenomination) => void
  reset: () => void
}

export const useVendingStore = create<VendingStore>((set) => ({
  // Initial state
  products: PRODUCTS,
  currentBalance: 0,
  selectedProduct: null,
  paymentMethod: null,
  status: 'idle',
  lastTransaction: null,
  method: null,
  insertedCash: {
    100: 0,
    500: 0, 
    1000: 0,
    5000: 0,
    10000: 0,
  },
  totalInserted: 0,
  cardStatus: 'idle',
  
  // Actions
  selectProduct: (productId) => set({ selectedProduct: productId }),
  setPaymentMethod: (method) => set({ paymentMethod: method, method }),
  insertCash: (denomination) => set((state) => ({
    insertedCash: {
      ...state.insertedCash,
      [denomination]: state.insertedCash[denomination] + 1,
    },
    totalInserted: state.totalInserted + denomination,
    currentBalance: state.currentBalance + denomination,
  })),
  reset: () => set({
    selectedProduct: null,
    paymentMethod: null,
    currentBalance: 0,
    status: 'idle',
    method: null,
    insertedCash: { 100: 0, 500: 0, 1000: 0, 5000: 0, 10000: 0 },
    totalInserted: 0,
    cardStatus: 'idle',
  }),
}))