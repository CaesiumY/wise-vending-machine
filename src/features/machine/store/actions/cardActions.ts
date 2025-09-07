import type { StateCreator } from "zustand";
import type { ProductType } from "@/features/products/types/product.types";
import type { ActionResult, DispenseData } from "@/shared/types/utility.types";
import type { Transaction, VendingStore } from "../../types/vending.types";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { EMPTY_BREAKDOWN } from "@/features/payment/constants/denominations";

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
      return { success: false, error: "선택된 상품이 없습니다." };
    }

    const product = products[productId];

    set({
      selectedProduct: productId,
      status: "cardProcess",
      showPaymentConfirm: false,
    });

    // adminStore 설정 확인
    const adminState = useAdminStore.getState();

    // 카드 인식 실패 시뮬레이션
    if (adminState.cardReaderFault) {
      return {
        success: false,
        error: "카드 인식 실패",
        errorType: "cardReaderFault"
      };
    }

    // 결제 거부 시뮬레이션
    if (adminState.cardPaymentReject) {
      return {
        success: false,
        error: "결제 거부",
        errorType: "cardPaymentReject"
      };
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
    const dispenseResult = get().dispenseProduct();
    
    // 배출 결과 반환 (성공/실패 모두)
    return dispenseResult;
  },

  cancelCardPayment: () => {
    set({
      selectedProduct: null,
      selectedProductForCard: null,
      showPaymentConfirm: false,
    });
  },
});