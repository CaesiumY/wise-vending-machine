import type { StateCreator } from "zustand";
import type { VendingStore } from "../../types/vending.types";
import type { ActionResult } from "@/shared/types/utility.types";
import { toast } from "sonner";

// 리셋 액션 인터페이스
export interface ResetActions {
  reset: () => void;
  resetPaymentMethod: () => ActionResult;
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
    get().resetPayment();      // PaymentSlice
    get().resetProducts();     // ProductSlice - 추가 예정
    get().resetTransaction();  // TransactionSlice - 추가 예정  
    get().resetUi();           // UiSlice
  },

  resetPaymentMethod: (): ActionResult => {
    const { status, currentBalance } = get();

    // 결제 방식 리셋 가능한 상태인지 확인
    if (
      status === "dispensing" ||
      status === "completing"
    ) {
      return {
        success: false,
        error: "현재 상태에서는 결제 방식을 변경할 수 없습니다.",
      };
    }

    // 현금이 투입된 상태라면 반환 처리
    if (currentBalance > 0) {
      toast.info(`${currentBalance}원이 반환되었습니다.`);
    }

    // 슬라이스별 리셋 호출
    get().resetPayment();
    get().clearError();
    
    // 선택된 상품 직접 초기화
    set({ selectedProduct: null });
    
    return { success: true };
  },
});