import type { StateCreator } from "zustand";
import type { VendingStore } from "../../types/vending.types";
import type { ActionResult, RefundData } from "@/shared/types/utility.types";
import { formatCurrency } from "@/shared/utils/formatters";
import { ErrorTypes } from "@/features/machine/constants/errorTypes";

// 리셋 액션 인터페이스
export interface ResetActions {
  reset: () => void;
  resetPaymentMethod: () => ActionResult<RefundData | void>;
}

// 리셋 액션 생성 함수
export const createResetActions: StateCreator<
  VendingStore,
  [],
  [],
  ResetActions
> = (set, get, _api) => ({
  reset: () => {
    // 각 슬라이스의 리셋 함수 호출
    get().resetPayment();           // PaymentSlice
    get().clearProductSelection();  // ProductSlice
    get().resetTransaction();       // TransactionSlice
    get().resetUi();                // UiSlice
  },

  resetPaymentMethod: (): ActionResult<RefundData | void> => {
    const { status, currentBalance } = get();

    if (
      status === "dispensing" ||
      status === "completing"
    ) {
      return {
        success: false,
        error: "현재 상태에서는 결제 방식을 변경할 수 없습니다.",
        errorType: ErrorTypes.INVALID_STATE
      };
    }

    const refundData = currentBalance > 0 ? {
      refundAmount: currentBalance,
      message: `${formatCurrency(currentBalance)}이 반환되었습니다.`
    } : undefined;

    // 슬라이스별 리셋 호출
    get().resetPayment();
    get().clearError();
    
    set({ 
      selectedProduct: null,
      status: "idle"
    });
    
    return { 
      success: true,
      data: refundData
    };
  },
});