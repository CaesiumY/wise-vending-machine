import type { StateCreator } from "zustand";
import type { VendingStore } from "../../types/vending.types";
import type { ProductType } from "@/features/products/types/product.types";
import type { PaymentMethod } from "@/features/payment/types/payment.types";
import type { ActionResult } from "@/shared/types/utility.types";

// 통합 액션 인터페이스
export interface IntegrationActions {
  setPaymentMethod: (method: PaymentMethod) => ActionResult;
  selectProduct: (productId: ProductType) => ActionResult;
}

// 통합 액션 생성 함수
export const createIntegrationActions: StateCreator<
  VendingStore,
  [],
  [],
  IntegrationActions
> = (set, get, _api) => ({
  setPaymentMethod: (method: PaymentMethod): ActionResult => {
    const { status } = get();

    // 대기 상태에서만 결제 방식 선택 가능
    if (status !== "idle") {
      return {
        success: false,
        error: "결제 방식을 선택할 수 없는 상태입니다.",
      };
    }

    set({
      paymentMethod: method,
      status: method === "cash" ? "cashInput" : "cardProcess",
    });

    return { success: true };
  },

  selectProduct: (productId: ProductType): ActionResult => {
    const { status, currentBalance, products, paymentMethod } = get();

    // 음료 선택 가능한 상태인지 확인
    if (status !== "productSelect" && status !== "cardProcess") {
      return { success: false, error: "음료를 선택할 수 없는 상태입니다." };
    }

    const product = products[productId];
    if (!product) {
      return { success: false, error: "존재하지 않는 상품입니다." };
    }

    // 재고 확인
    if (product.stock <= 0) {
      get().setError("outOfStock", `${product.name}이(가) 품절되었습니다.`);
      return {
        success: false,
        error: `${product.name}이(가) 품절되었습니다.`,
      };
    }

    // 현금 결제시 잔액 확인
    if (paymentMethod === "cash" && currentBalance < product.price) {
      get().setError(
        "changeShortage",
        `잔액이 부족합니다. (필요: ${product.price}원, 보유: ${currentBalance}원)`
      );
      return { success: false, error: "잔액이 부족합니다." };
    }

    set({ selectedProduct: productId });

    // 결제 방식에 따라 처리 분기
    if (paymentMethod === "cash") {
      get().processCashTransaction(productId);
    } else {
      // 카드 결제: 음료 선택만 저장하고 결제 확인 대기
      set({
        selectedProductForCard: productId,
        showPaymentConfirm: true,
      });
    }

    return { success: true };
  },

});