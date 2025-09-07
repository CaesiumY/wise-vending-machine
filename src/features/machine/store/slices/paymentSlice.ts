import type { StateCreator } from "zustand";
import type {
  PaymentMethod,
  CashDenomination,
} from "@/features/payment/types/payment.types";
import type { ProductType } from "@/features/products/types/product.types";
import type { VendingStore } from "../../types/vending.types";

// 결제 관련 상태 인터페이스
export interface PaymentSlice {
  // 현금 결제 관련 상태
  currentBalance: number;
  insertedCash: CashDenomination[];
  lastInsertTime: number;

  // 결제 방식 관련 상태
  paymentMethod: PaymentMethod | null;

  // 카드 결제 관련 상태
  selectedProductForCard: ProductType | null;
  showPaymentConfirm: boolean;

  // 기본 액션들 (단순한 상태 변경만) - 내부적으로 사용되는 함수만 유지
  resetPayment: () => void;
}

// 결제 슬라이스 생성 함수
export const createPaymentSlice: StateCreator<
  VendingStore,
  [],
  [],
  PaymentSlice
> = (set, _get, _api) => ({
  // 초기 상태
  currentBalance: 0,
  insertedCash: [],
  lastInsertTime: 0,
  paymentMethod: null,
  selectedProductForCard: null,
  showPaymentConfirm: false,

  // 기본 액션들 - 내부적으로 사용되는 함수만 유지
  resetPayment: () =>
    set({
      currentBalance: 0,
      insertedCash: [],
      lastInsertTime: 0,
      paymentMethod: null,
      selectedProductForCard: null,
      showPaymentConfirm: false,
    }),
});