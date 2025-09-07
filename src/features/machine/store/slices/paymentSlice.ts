import type { StateCreator } from "zustand";
import type {
  PaymentMethod,
  CashDenomination,
} from "@/features/payment/types/payment.types";
import type { ProductType } from "@/features/products/types/product.types";
import type { VendingStore } from "../../types/vending.types";

// 결제 상태 인터페이스 (상태만)
interface PaymentState {
  // 현금 결제 관련 상태
  currentBalance: number;
  insertedCash: CashDenomination[];
  lastInsertTime: number;

  // 결제 방식 관련 상태
  paymentMethod: PaymentMethod | null;

  // 카드 결제 관련 상태
  selectedProductForCard: ProductType | null;
  showPaymentConfirm: boolean;
}

// 초기 상태 (재사용 가능)
const initialPaymentState: PaymentState = {
  currentBalance: 0,
  insertedCash: [],
  lastInsertTime: 0,
  paymentMethod: null,
  selectedProductForCard: null,
  showPaymentConfirm: false,
};

// 결제 액션 인터페이스 (액션만)
interface PaymentActions {
  resetPayment: () => void;
}

// 결제 슬라이스 타입 (상태 + 액션)
export interface PaymentSlice extends PaymentState, PaymentActions {}

// 결제 슬라이스 생성 함수
export const createPaymentSlice: StateCreator<
  VendingStore,
  [],
  [],
  PaymentSlice
> = (set, _get, _api) => ({
  // 초기 상태 spread
  ...initialPaymentState,

  // 액션들
  resetPayment: () => set(initialPaymentState),
});