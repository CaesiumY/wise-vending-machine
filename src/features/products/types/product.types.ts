// 상품 타입
export type ProductType = 'cola' | 'water' | 'coffee'

// 상품 정보
export interface Product {
  id: ProductType
  name: string
  price: number
  stock: number
}


