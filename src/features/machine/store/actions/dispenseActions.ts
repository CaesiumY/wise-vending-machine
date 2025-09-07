import type { StateCreator } from "zustand";
import type { VendingStore } from "../../types/vending.types";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { isCashPayment, isCardPayment, ensureNonNegative } from "@/shared/utils/paymentHelpers";
import { formatCurrency } from "@/shared/utils/formatters";
import { ErrorTypes } from "@/features/machine/constants/errorTypes";

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
      return { 
        success: false, 
        error: "선택된 상품이 없습니다.",
        errorType: ErrorTypes.PRODUCT_NOT_FOUND
      };
    }

    set({ status: "dispensing" });

    // 배출 실패 모드 체크
    if (adminState.dispenseFaultMode) {
      const product = products[selectedProduct];

      // 카드 결제 실패 시 상태만 초기화
      if (!isCashPayment(paymentMethod)) {
        set({ 
          status: "cardProcess",
          selectedProduct: null,
          selectedProductForCard: null,
        });

        return {
          success: false,
          error: "배출에 실패했습니다. 결제가 취소되었습니다. 다시 선택해주세요.",
          errorType: ErrorTypes.DISPENSE_FAILURE,
          data: { paymentMethod: "card", paymentCancelled: true }
        };
      }

      // 현금 결제 실패 시
      set((state: VendingStore) => ({
        currentBalance: state.currentBalance + product.price,
        status: "productSelect",
        selectedProduct: null,
      }));

      return {
        success: false,
        error: "배출에 실패했습니다. 잔액이 복구되었습니다. 다시 선택해주세요.",
        errorType: ErrorTypes.DISPENSE_FAILURE,
        data: { paymentMethod: "cash", balanceRestored: true }
      };
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
    if (!isCashPayment(paymentMethod)) {
      return { success: true };
    }

    const { currentBalance } = get();

    // 잔액이 0원인 경우 → 대기 상태로 전환
    if (currentBalance === 0) {
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
  },

});