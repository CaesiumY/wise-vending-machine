import type { StateCreator } from "zustand";
import type { ProductType } from "@/features/products/types/product.types";
import type { ActionResult, DispenseData } from "@/shared/types/utility.types";
import type { Transaction, VendingStore } from "../../types/vending.types";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { EMPTY_BREAKDOWN } from "@/features/payment/constants/denominations";
import { ErrorTypes } from "@/features/machine/constants/errorTypes";
import { toast } from "sonner";

// 카드 관련 액션 인터페이스
export interface CardActions {
  confirmCardPayment: (productId: ProductType) => ActionResult<DispenseData>;
  cancelCardPayment: () => void;
}

// 카드 액션 생성 함수
export const createCardActions: StateCreator<
  VendingStore,
  [],
  [],
  CardActions
> = (set, get, _api) => ({
  confirmCardPayment: (productId: ProductType): ActionResult<DispenseData> => {
    const state = get();
    const { products } = state;

    if (!productId) {
      return {
        success: false,
        error: "선택된 상품이 없습니다.",
        errorType: ErrorTypes.PRODUCT_NOT_FOUND,
      };
    }

    const product = products[productId];
    const adminState = useAdminStore.getState();

    // 결제 시도 시 타임아웃 연장
    const handleTimeout = () => {
      const currentState = get();
      if (currentState.paymentMethod === "card") {
        // 타임아웃으로 결제 방식 초기화
        currentState.resetPaymentMethod();
        toast.error("시간 초과로 카드 결제가 취소되었습니다.");
      }
    };

    state.extendPaymentTimeout(handleTimeout);

    // 카드 인식 실패 체크를 먼저 수행
    if (adminState.cardReaderFault) {
      set({
        selectedProduct: null,
        selectedProductForCard: null,
        showPaymentConfirm: false,
        status: "cardProcess",
      });

      return {
        success: false,
        error: "카드를 인식할 수 없습니다. 카드를 다시 확인해주세요.",
        errorType: ErrorTypes.CARD_READER_FAULT,
      };
    }

    // 결제 거부 체크
    if (adminState.cardPaymentReject) {
      set({
        selectedProduct: null,
        selectedProductForCard: null,
        showPaymentConfirm: false,
        status: "cardProcess",
      });

      return {
        success: false,
        error: "카드 결제가 거부되었습니다. 다른 카드를 사용해주세요.",
        errorType: ErrorTypes.CARD_PAYMENT_REJECT,
      };
    }

    // 결제 성공 시 타임아웃 클리어 
    state.clearPaymentTimeout();

    // 결제 성공 시에만 상태 변경
    set({
      selectedProduct: productId,
      status: "cardProcess",
      showPaymentConfirm: false,
    });

    // 결제 성공 - 거래 생성
    const transaction: Transaction = {
      id: Date.now().toString(),
      productId: productId,
      productName: product.name,
      amount: product.price,
      paymentMethod: "card",
      change: 0,
      changeBreakdown: {
        canProvideChange: true,
        totalChange: 0,
        breakdown: { ...EMPTY_BREAKDOWN },
      },
      timestamp: new Date(),
      status: "pending",
    };

    set({
      lastTransaction: transaction,
      status: "dispensing",
    });

    const dispenseResult = get().dispenseProduct();

    // 배출 결과 반환 (성공/실패 모두)
    return dispenseResult;
  },

  cancelCardPayment: () => {
    const state = get();
    
    // 결제 취소 시 타임아웃 클리어
    state.clearPaymentTimeout();
    
    set({
      selectedProduct: null,
      selectedProductForCard: null,
      showPaymentConfirm: false,
    });
  },
});
