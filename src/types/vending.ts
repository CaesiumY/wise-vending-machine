import type { PaymentMethod } from './payment'

export type ProductType = 'cola' | 'water' | 'coffee'

export interface Product {
  id: ProductType
  name: string
  price: number
  stock: number
  image?: string
}

export interface VendingMachineState {
  products: Record<ProductType, Product>
  currentBalance: number
  selectedProduct: ProductType | null
  paymentMethod: PaymentMethod | null
  status: 'idle' | 'payment-pending' | 'dispensing' | 'error'
  lastTransaction: Transaction | null
}

export interface Transaction {
  id: string
  productId: ProductType
  amount: number
  paymentMethod: PaymentMethod
  change: number
  timestamp: Date
  status: 'success' | 'failed' | 'cancelled'
}