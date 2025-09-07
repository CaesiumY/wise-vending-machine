import type { PaymentMethod } from "@/features/payment/types/payment.types";
import type { VendingStatus } from "@/features/machine/types/vending.types";

// 상품 타입
export type ProductType = 'cola' | 'water' | 'coffee'

// 상품 정보
export interface Product {
  id: ProductType
  name: string
  price: number
  stock: number
}

// 버튼 상태 타입
export const ButtonState = {
  OUT_OF_STOCK: 'out-of-stock',
  SELECTED: 'selected', 
  INSUFFICIENT_FUNDS: 'insufficient-funds',
  AVAILABLE: 'available',
  DISABLED: 'disabled',
} as const;

export type ButtonStateType = typeof ButtonState[keyof typeof ButtonState];

// 자판기 상태 컨텍스트 타입
export interface VendingContext {
  selectedProduct: ProductType | null;
  paymentMethod: PaymentMethod | null;
  status: VendingStatus;
  currentBalance: number;
}
