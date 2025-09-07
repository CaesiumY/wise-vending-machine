import type { StateCreator } from "zustand";
import type { ActionResult } from "@/shared/types/utility.types";
import type { Transaction, ErrorType, VendingStore } from "../../types/vending.types";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { getErrorMessage } from "../../constants/errorMessages";
import { toast } from "sonner";

// 카드 관련 액션 인터페이스
export interface CardActions {
  confirmCardPayment: () => Promise<ActionResult>;
  cancelCardPayment: () => void;
}

// 카드 액션 생성 함수
export const createCardActions: StateCreator<
  VendingStore,
  [],
  [],
  CardActions
> = (set, get, _api) => ({
  
  confirmCardPayment: async (): Promise<ActionResult> => {
    const state = get();
    const { selectedProductForCard, products } = state;

    if (!selectedProductForCard) {
      return { success: false, error: "선택된 상품이 없습니다." };
    }

    const product = products[selectedProductForCard];

    set({
      showPaymentConfirm: false,
      selectedProduct: selectedProductForCard,
      status: "cardProcess",
    });

    try {
      // adminStore 설정 확인
      const adminState = useAdminStore.getState();

      // 카드 인식 실패 시뮬레이션
      if (adminState.cardReaderFault) {
        toast.error("카드 인식 실패 ❌");
        throw new Error("cardReaderFault");
      }

      // 결제 거부 시뮬레이션
      if (adminState.cardPaymentReject) {
        toast.error("결제 거부 ❌");
        throw new Error("cardPaymentReject");
      }

      // 결제 성공 - 거래 생성
      const transaction: Transaction = {
        id: Date.now().toString(),
        productId: selectedProductForCard,
        productName: product.name,
        amount: product.price,
        paymentMethod: "card",
        change: 0,
        changeBreakdown: {
          canProvideChange: true,
          totalChange: 0,
          breakdown: { 100: 0, 500: 0, 1000: 0, 5000: 0, 10000: 0 },
        },
        timestamp: new Date(),
        status: "pending",
      };

      set({
        lastTransaction: transaction,
        status: "dispensing",
      });

      // 배출 처리
      state.dispenseProduct();

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "unknown_error";
      const errorType = errorMessage as ErrorType;

      state.setError(errorType, getErrorMessage(errorType));

      set({
        status: "productSelect", // 재선택 가능
      });

      return { success: false, errorType };
    }
  },

  cancelCardPayment: () => {
    set({
      selectedProductForCard: null,
      showPaymentConfirm: false,
      selectedProduct: null,
    });
  },
});