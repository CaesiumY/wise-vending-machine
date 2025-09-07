import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  VendingStore,
} from "../types/vending.types";
import type { ProductType } from "@/features/products/types/product.types";
import type {
  PaymentMethod,
} from "@/features/payment/types/payment.types";
import type { ActionResult } from "@/shared/types/utility.types";
import { toast } from "sonner";
import { PRODUCTS } from "@/features/products/constants/products";

// 슬라이스 임포트
import { createPaymentSlice } from "./slices/paymentSlice";
import { createProductSlice } from "./slices/productSlice";
import { createTransactionSlice } from "./slices/transactionSlice";
import { createUiSlice } from "./slices/uiSlice";

// 액션 임포트
import { createCashActions } from "./actions/cashActions";
import { createCardActions } from "./actions/cardActions";
import { createDispenseActions } from "./actions/dispenseActions";

// 슬라이스와 액션을 조합한 통합 스토어 생성
export const useVendingStore = create<VendingStore>()(
  devtools((set, get, api) => ({
    // 슬라이스 조합
    ...createPaymentSlice(set, get, api),
    ...createProductSlice(set, get, api),
    ...createTransactionSlice(set, get, api),
    ...createUiSlice(set, get, api),

    // 액션 조합
    ...createCashActions(set, get, api),
    ...createCardActions(set, get, api),
    ...createDispenseActions(set, get, api),

    // ===== 통합 액션들 =====
    
    // 기본 설정 액션 (스토어 전체를 관리)
    setPaymentMethod: (method: PaymentMethod): ActionResult => {
      const { status } = get();

      // 대기 상태에서만 결제 방식 선택 가능
      if (status !== "idle") {
        return {
          success: false,
          error: "결제 방식을 선택할 수 없는 상태입니다.",
        };
      }

      set({
        paymentMethod: method,
        status: method === "cash" ? "cashInput" : "cardProcess",
      });

      return { success: true };
    },

    selectProduct: (productId: ProductType): ActionResult => {
      const { status, currentBalance, products, paymentMethod } = get();

      // 음료 선택 가능한 상태인지 확인
      if (status !== "productSelect" && status !== "cardProcess") {
        return { success: false, error: "음료를 선택할 수 없는 상태입니다." };
      }

      const product = products[productId];
      if (!product) {
        return { success: false, error: "존재하지 않는 상품입니다." };
      }

      // 재고 확인
      if (product.stock <= 0) {
        get().setError("outOfStock", `${product.name}이(가) 품절되었습니다.`);
        return {
          success: false,
          error: `${product.name}이(가) 품절되었습니다.`,
        };
      }

      // 현금 결제시 잔액 확인
      if (paymentMethod === "cash" && currentBalance < product.price) {
        get().setError(
          "changeShortage",
          `잔액이 부족합니다. (필요: ${product.price}원, 보유: ${currentBalance}원)`
        );
        return { success: false, error: "잔액이 부족합니다." };
      }

      set({ selectedProduct: productId });

      // 결제 방식에 따라 처리 분기
      if (paymentMethod === "cash") {
        get().processCashTransaction(productId);
      } else {
        // 카드 결제: 음료 선택만 저장하고 결제 확인 대기
        set({
          selectedProductForCard: productId,
          showPaymentConfirm: true,
        });
      }

      return { success: true };
    },

    reset: () => {
      // 각 슬라이스 직접 초기화
      get().resetPayment(); // PaymentSlice - 유지됨
      
      // ProductSlice 직접 초기화 (제거된 resetProducts 대체)
      set({
        products: PRODUCTS,
        selectedProduct: null,
      });
      
      // TransactionSlice 직접 초기화 (제거된 resetTransactions 대체)  
      set({
        lastTransaction: null,
      });
      
      get().resetUi(); // UiSlice - 유지됨
    },

    resetPaymentMethod: (): ActionResult => {
      const { status, currentBalance } = get();

      // 결제 방식 리셋 가능한 상태인지 확인
      if (
        status === "dispensing" ||
        status === "completing" ||
        status === "maintenance"
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
      get().setSelectedProduct(null);
      get().clearError();
      
      return { success: true };
    },

    // 유틸리티 메서드들 (기존 호환성을 위해 유지)
    updateStock: (productId: ProductType, change: number) => {
      const { products } = get();
      const currentStock = products[productId]?.stock || 0;
      get().updateProductStock(productId, currentStock + change);
    },
  }),
  { name: "useVendingStore" } // Redux DevTools에서 표시될 이름
)
);
