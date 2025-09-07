import type { PaymentMethod } from '@/features/payment/types/payment.types';
import type { VendingStatus } from '@/features/machine/types/vending.types';

export type ProductType = 'cola' | 'water' | 'coffee';

// 상품 정보
export interface Product {
  id: ProductType;
  name: string;
  price: number;
  stock: number;
}

export const ButtonState = {
  OUT_OF_STOCK: 'out-of-stock',
  SELECTED: 'selected',
  INSUFFICIENT_FUNDS: 'insufficient-funds',
  AVAILABLE: 'available',
  DISABLED: 'disabled',
} as const;

export type ButtonStateType = (typeof ButtonState)[keyof typeof ButtonState];

export interface VendingContext {
  selectedProduct: ProductType | null;
  paymentMethod: PaymentMethod | null;
  status: VendingStatus;
  currentBalance: number;
}
