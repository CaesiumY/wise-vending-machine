import type { ProductType } from '@/shared/types/common.types'

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

// 상품 목록 타입
export type ProductsRecord = Record<ProductType, Product>

// 상품 재고 업데이트 결과
export interface StockUpdateResult {
  success: boolean
  previousStock: number
  newStock: number
  productId: ProductType
}

// 상품 가용성 체크 결과
export interface ProductAvailability {
  productId: ProductType
  isAvailable: boolean
  reason?: 'out_of_stock' | 'insufficient_balance' | 'system_error'
  requiredAmount?: number
}

// Export ProductType for convenience
export type { ProductType }