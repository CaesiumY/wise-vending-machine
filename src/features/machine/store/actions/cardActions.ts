import type { StateCreator } from "zustand";
import type { ActionResult } from "@/shared/types/utility.types";
import type { Transaction, ErrorType, VendingStore } from "../../types/vending.types";
import type { ProductType } from "@/features/products/types/product.types";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { getErrorMessage } from "../../constants/errorMessages";
import { EMPTY_BREAKDOWN } from "@/features/payment/constants/denominations";
import { toast } from "sonner";

// 카드 관련 액션 인터페이스
export interface CardActions {
  confirmCardPayment: (productId: ProductType) => ActionResult;
  cancelCardPayment: () => void;
}

// 카드 액션 생성 함수
export const createCardActions: StateCreator<
  VendingStore,
  [],
  [],
  CardActions
> = (set, get, _api) => ({
  
  confirmCardPayment: (productId: ProductType): ActionResult => {
    const state = get();
    const { products } = state;

    if (!productId) {
      return { success: false, error: "선택된 상품이 없습니다." };
    }

    const product = products[productId];

    set({
      selectedProduct: productId,
      status: "cardProcess",
      showPaymentConfirm: false,
    });

    try {
      // adminStore 설정 확인
      const adminState = useAdminStore.getState();

      // 카드 인식 실패 시뮬레이션
      if (adminState.cardReaderFault) {
        toast.error("카드 인식 실패");
        throw new Error("cardReaderFault");
      }

      // 결제 거부 시뮬레이션
      if (adminState.cardPaymentReject) {
        toast.error("결제 거부");
        throw new Error("cardPaymentReject");
      }

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

      // 배출 처리
      get().dispenseProduct();

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "unknown_error";
      const errorType = errorMessage as ErrorType;

      state.setError(errorType, getErrorMessage(errorType));

      set({
        status: "productSelect", // 재선택 가능
      });

      return { success: false, error: getErrorMessage(errorType) };
    }
  },

  cancelCardPayment: () => {
    set({
      selectedProduct: null,
      selectedProductForCard: null,
      showPaymentConfirm: false,
    });
  },
});