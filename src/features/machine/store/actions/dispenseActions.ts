import type { StateCreator } from "zustand";
import type { VendingStore } from "../../types/vending.types";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { isCashPayment, isCardPayment, ensureNonNegative } from "@/shared/utils/paymentHelpers";
import { formatCurrency } from "@/shared/utils/formatters";

import type { ActionResult, DispenseData } from "@/shared/types/utility.types";

// 배출 관련 액션 인터페이스
export interface DispenseActions {
  dispenseProduct: () => ActionResult<DispenseData>;
}

// 배출 액션 생성 함수
export const createDispenseActions: StateCreator<
  VendingStore,
  [],
  [],
  DispenseActions
> = (set, get, _api) => ({
  
  dispenseProduct: (): ActionResult<DispenseData> => {
    const { selectedProduct, paymentMethod, products, reset } = get();
    const adminState = useAdminStore.getState();

    if (!selectedProduct) {
      return { success: false, error: "선택된 상품이 없습니다." };
    }

    set({ status: "dispensing" });

    // 배출 실패 모드 체크
    if (adminState.dispenseFaultMode) {
      const product = products[selectedProduct];

      // 현금 결제인 경우 잔액 복구 및 적절한 상태 전환
      if (isCashPayment(paymentMethod)) {
        set((state: VendingStore) => ({
          currentBalance: state.currentBalance + product.price, // 잔액 복구
          status: "productSelect", // 다시 선택 가능 상태로
          selectedProduct: null,
        }));

        return {
          success: false,
          error: "배출에 실패했습니다. 잔액이 복구되었습니다. 다시 선택해주세요.",
          errorType: "dispenseFailure",
          data: { paymentMethod: "cash", balanceRestored: true }
        };
      } else {
        // 카드 결제는 별도 취소 처리가 있으므로 idle 상태로
        set({ status: "idle" });

        return {
          success: false,
          error: "배출에 실패했습니다. 결제가 취소됩니다.",
          errorType: "dispenseFailure",
          data: { paymentMethod: "card", paymentCancelled: true }
        };
      }
    }

    // 배출 성공 - 재고 감소 처리
    const updatedProducts = { ...products };
    if (updatedProducts[selectedProduct]) {
      updatedProducts[selectedProduct] = {
        ...updatedProducts[selectedProduct],
        stock: ensureNonNegative(updatedProducts[selectedProduct].stock - 1),
      };
    }

    set({
      status: "completing",
      products: updatedProducts,
    });

    // 배출 성공 정보
    const productName = products[selectedProduct].name;

    // 카드 결제는 바로 대기 상태로 복귀
    if (isCardPayment(paymentMethod)) {
      reset();
      return { 
        success: true, 
        data: { 
          productName,
          message: `${productName}이(가) 배출되었습니다!`,
          paymentMethod: "card"
        }
      };
    }

    // 현금 결제 후 잔액 확인 (다이어그램의 '잔액 확인' 단계)
    if (isCashPayment(paymentMethod)) {
      const { currentBalance } = get();

      // 다이어그램: 단순히 잔액이 0원인지 아닌지만 확인
      if (currentBalance > 0) {
        // 잔액이 0원이 아닌 경우 → 음료 선택 가능 상태로 (연속 구매)
        set({
          status: "productSelect",
          selectedProduct: null,
        });

        return { 
          success: true, 
          data: { 
            productName,
            message: `${productName}이(가) 배출되었습니다!`,
            paymentMethod: "cash",
            remainingBalance: currentBalance,
            balanceMessage: `잔액 ${formatCurrency(currentBalance)}이 남아있습니다. 추가 구매가 가능합니다.`
          }
        };
      } else {
        // 잔액이 0원인 경우 → 대기 상태로 전환
        reset();
        return { 
          success: true, 
          data: { 
            productName,
            message: `${productName}이(가) 배출되었습니다!`,
            paymentMethod: "cash",
            remainingBalance: 0
          }
        };
      }
    }

    return { success: true };
  },

});