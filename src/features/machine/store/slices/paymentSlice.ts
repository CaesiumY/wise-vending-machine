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

  // 카드 결제 관련 상태 (CardPanel에서 사용)
  selectedProductForCard: ProductType | null;
  showPaymentConfirm: boolean;

  // 타임아웃 관련 상태
  paymentTimeout: NodeJS.Timeout | null;
  paymentStartTime: number | null;
}

// 타임아웃 상수 (30초)
const PAYMENT_TIMEOUT_MS = 30000;

// 초기 상태 (재사용 가능)
const initialPaymentState: PaymentState = {
  currentBalance: 0,
  insertedCash: [],
  lastInsertTime: 0,
  paymentMethod: null,
  selectedProductForCard: null,
  showPaymentConfirm: false,
  paymentTimeout: null,
  paymentStartTime: null,
};

// 결제 액션 인터페이스 (액션만)
interface PaymentActions {
  resetPayment: () => void;
  clearPaymentTimeout: () => void;
  startPaymentTimeout: (onTimeout: () => void) => void;
  extendPaymentTimeout: (onTimeout: () => void) => void;
}

// 결제 슬라이스 타입 (상태 + 액션)
export interface PaymentSlice extends PaymentState, PaymentActions {}

// 결제 슬라이스 생성 함수
export const createPaymentSlice: StateCreator<
  VendingStore,
  [],
  [],
  PaymentSlice
> = (set, get, _api) => ({
  // 초기 상태 spread
  ...initialPaymentState,

  // 액션들
  resetPayment: () => {
    const state = get();
    // 기존 타임아웃 정리
    if (state.paymentTimeout) {
      clearTimeout(state.paymentTimeout);
    }
    set(initialPaymentState);
  },

  clearPaymentTimeout: () => {
    const state = get();
    if (state.paymentTimeout) {
      clearTimeout(state.paymentTimeout);
      set({ 
        paymentTimeout: null, 
        paymentStartTime: null 
      });
    }
  },

  startPaymentTimeout: (onTimeout: () => void) => {
    const state = get();
    // 기존 타임아웃이 있으면 먼저 정리
    if (state.paymentTimeout) {
      clearTimeout(state.paymentTimeout);
    }

    const timeoutId = setTimeout(onTimeout, PAYMENT_TIMEOUT_MS);
    set({
      paymentTimeout: timeoutId,
      paymentStartTime: Date.now(),
    });
  },

  extendPaymentTimeout: (onTimeout: () => void) => {
    const state = get();
    // 기존 타임아웃 정리
    if (state.paymentTimeout) {
      clearTimeout(state.paymentTimeout);
    }

    // 새로운 타임아웃 설정 (30초 연장)
    const timeoutId = setTimeout(onTimeout, PAYMENT_TIMEOUT_MS);
    set({
      paymentTimeout: timeoutId,
      paymentStartTime: Date.now(),
    });
  },
});

// 타임아웃 상수를 외부로 export
export { PAYMENT_TIMEOUT_MS };