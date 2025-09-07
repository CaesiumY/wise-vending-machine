import type { StateCreator } from "zustand";
import type { ProductType } from "@/features/products/types/product.types";
import type { ActionResult, DispenseData } from "@/shared/types/utility.types";
import type { Transaction, VendingStore } from "../../types/vending.types";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { EMPTY_BREAKDOWN } from "@/features/payment/constants/denominations";
import { ErrorTypes } from "@/features/machine/constants/errorTypes";

export interface CardActions {
  confirmCardPayment: (productId: ProductType) => ActionResult<DispenseData>;
  cancelCardPayment: () => void;
}

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

    state.extendPaymentTimeout(() => {}, "card");

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

    state.clearPaymentTimeout();

    set({
      selectedProduct: productId,
      status: "cardProcess",
      showPaymentConfirm: false,
    });

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

    return dispenseResult;
  },

  cancelCardPayment: () => {
    const state = get();
    
    state.clearPaymentTimeout();
    
    set({
      selectedProduct: null,
      selectedProductForCard: null,
      showPaymentConfirm: false,
    });
  },
});
