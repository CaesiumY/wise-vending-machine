import type { StateCreator } from "zustand";
import type { VendingStore } from "../../types/vending.types";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { toast } from "sonner";

// 배출 관련 액션 인터페이스
export interface DispenseActions {
  dispenseProduct: () => boolean;
}

// 배출 액션 생성 함수
export const createDispenseActions: StateCreator<
  VendingStore,
  [],
  [],
  DispenseActions
> = (set, get, _api) => ({
  
  dispenseProduct: (): boolean => {
    const state = get();
    const { selectedProduct, paymentMethod, products } = state;
    const adminState = useAdminStore.getState();

    if (!selectedProduct) return false;

    set({ status: "dispensing" });

    // 배출 실패 모드 체크
    if (adminState.dispenseFaultMode) {
      const product = products[selectedProduct];

      // 현금 결제인 경우 잔액 복구 및 적절한 상태 전환
      if (paymentMethod === "cash") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set((state: any) => ({
          currentBalance: state.currentBalance + product.price, // 잔액 복구
          status: "productSelect", // 다시 선택 가능 상태로
          selectedProduct: null,
        }));

        toast.error("🚫 음료 배출 실패", {
          description:
            "배출에 실패했습니다. 잔액이 복구되었습니다. 다시 선택해주세요.",
        });
      } else {
        // 카드 결제는 별도 취소 처리가 있으므로 idle 상태로
        set({ status: "idle" });

        // 카드 결제는 기존 setError 방식 유지
        state.setError("dispenseFailure");
      }
      return false;
    }

    // 배출 성공 - 재고 감소 처리
    const updatedProducts = { ...products };
    if (updatedProducts[selectedProduct]) {
      updatedProducts[selectedProduct] = {
        ...updatedProducts[selectedProduct],
        stock: Math.max(0, updatedProducts[selectedProduct].stock - 1),
      };
    }

    set({
      status: "completing",
      products: updatedProducts,
    });

    // 모든 결제 방식에서 배출 완료 토스트 표시
    toast.success(`${products[selectedProduct].name}이(가) 배출되었습니다! 🎉`);

    // 카드 결제는 바로 대기 상태로 복귀
    if (paymentMethod === "card") {
      state.reset();
      return true;
    }

    // 현금 결제 후 잔액 확인 (다이어그램의 '잔액 확인' 단계)
    if (paymentMethod === "cash") {
      const { currentBalance } = get();

      // 다이어그램: 단순히 잔액이 0원인지 아닌지만 확인
      if (currentBalance > 0) {
        // 잔액이 0원이 아닌 경우 → 음료 선택 가능 상태로 (연속 구매)
        set({
          status: "productSelect",
          selectedProduct: null,
        });

        toast.info(
          `잔액 ${currentBalance}원이 남아있습니다. 추가 구매가 가능합니다.`
        );
        return true;
      } else {
        // 잔액이 0원인 경우 → 대기 상태로 전환
        state.reset();
        return true;
      }
    }

    return true;
  },

});