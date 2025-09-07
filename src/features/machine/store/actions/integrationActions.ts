import type { StateCreator } from "zustand";
import type { VendingStore } from "../../types/vending.types";
import type { ProductType } from "@/features/products/types/product.types";
import type { PaymentMethod } from "@/features/payment/types/payment.types";
import type { ActionResult, DispenseData } from "@/shared/types/utility.types";
import { isCashPayment } from "@/shared/utils/paymentHelpers";
import { formatCurrency } from "@/shared/utils/formatters";
import { isProductSelectionAllowed } from "@/features/machine/utils/statusHelpers";
import { ErrorTypes } from "@/features/machine/constants/errorTypes";
import { toast } from "sonner";

// 통합 액션 인터페이스
export interface IntegrationActions {
  setPaymentMethod: (method: PaymentMethod) => ActionResult<void>;
  selectProduct: (productId: ProductType) => ActionResult<DispenseData | void>;
}

// 통합 액션 생성 함수
export const createIntegrationActions: StateCreator<
  VendingStore,
  [],
  [],
  IntegrationActions
> = (set, get, _api) => ({
  setPaymentMethod: (method: PaymentMethod): ActionResult<void> => {
    const state = get();
    const { status } = state;

    if (status !== "idle") {
      return {
        success: false,
        error: "결제 방식을 선택할 수 없는 상태입니다.",
        errorType: ErrorTypes.INVALID_STATE
      };
    }

    set({
      paymentMethod: method,
      status: method === "cash" ? "cashInput" : "cardProcess",
    });

    // 카드 결제 선택 시 타임아웃 시작
    if (method === "card") {
      const handleTimeout = () => {
        const currentState = get();
        if (currentState.paymentMethod === "card") {
          // 타임아웃으로 결제 방식 초기화
          currentState.resetPaymentMethod();
          toast.error("시간 초과로 카드 결제가 취소되었습니다.");
        }
      };

      state.startPaymentTimeout(handleTimeout);
    } else {
      // 현금 결제 선택 시 타임아웃 클리어 (혹시 있다면)
      state.clearPaymentTimeout();
    }

    return { success: true };
  },

  selectProduct: (productId: ProductType): ActionResult<DispenseData | void> => {
    const { status, currentBalance, products, paymentMethod } = get();

    if (!isProductSelectionAllowed(status)) {
      return { 
        success: false, 
        error: "음료를 선택할 수 없는 상태입니다.",
        errorType: ErrorTypes.INVALID_STATE
      };
    }

    const product = products[productId];
    if (!product) {
      return { 
        success: false, 
        error: "존재하지 않는 상품입니다.",
        errorType: ErrorTypes.PRODUCT_NOT_FOUND
      };
    }

    // 재고 확인
    if (product.stock <= 0) {
      get().setError(ErrorTypes.OUT_OF_STOCK, `${product.name}이(가) 품절되었습니다.`);
      return {
        success: false,
        error: `${product.name}이(가) 품절되었습니다.`,
      };
    }

    // 현금 결제시 잔액 확인
    if (isCashPayment(paymentMethod) && currentBalance < product.price) {
      get().setError(
        "changeShortage",
        `잔액이 부족합니다. (필요: ${formatCurrency(product.price)}, 보유: ${formatCurrency(currentBalance)})`
      );
      return { 
        success: false, 
        error: "잔액이 부족합니다.",
        errorType: ErrorTypes.INVALID_STATE
      };
    }

    set({ selectedProduct: productId });

    // 현금 결제인 경우 즉시 처리
    if (isCashPayment(paymentMethod)) {
      return get().processCashTransaction(productId);
    }

    // 카드 결제인 경우 확인 화면 표시
    set({
      selectedProductForCard: productId,
      showPaymentConfirm: true,
    });

    // 카드 결제 시 음료 선택 시점에서 타임아웃 연장
    if (paymentMethod === "card") {
      const state = get();
      const handleTimeout = () => {
        const currentState = get();
        if (currentState.paymentMethod === "card") {
          // 타임아웃으로 결제 방식 초기화
          currentState.resetPaymentMethod();
          toast.error("시간 초과로 카드 결제가 취소되었습니다.");
        }
      };
      
      state.extendPaymentTimeout(handleTimeout);
    }

    return { success: true };
  },

});