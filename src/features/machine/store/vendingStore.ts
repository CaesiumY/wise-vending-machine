import { create } from "zustand";
import { devtools, combine } from "zustand/middleware";
import { toast } from "sonner";
import type {
  VendingState,
  VendingActions,
  Transaction,
  ChangeBreakdown,
  VendingStatus,
} from "../types/vending.types";
import type { ProductType } from "@/features/products/types/product.types";
import type {
  PaymentMethod,
  CashDenomination,
} from "@/features/payment/types/payment.types";
import type { ErrorType } from "@/features/machine/types/vending.types";
import type { ActionResult } from "@/shared/types/utility.types";
import { PRODUCTS } from "@/features/products/constants/products";
import { calculateOptimalChange } from "@/features/payment/utils/changeCalculator";
import { getErrorMessage } from "../constants/errorMessages";
import {
  validateCashDenomination,
  validateInsertionState,
} from "@/shared/utils/validators";
import { formatSuccessMessage } from "@/shared/utils/formatters";
import { useAdminStore } from "@/features/admin/store/adminStore";

// 초기 상태 정의
const initialState: VendingState = {
  // 기본 상태
  products: PRODUCTS,
  currentBalance: 0,
  selectedProduct: null,
  paymentMethod: null,
  status: "idle",
  isOperational: true,

  // 카드 결제 관련
  selectedProductForCard: null,
  showPaymentConfirm: false,

  // 현금 투입 관련
  insertedCash: [],
  lastInsertTime: 0,

  // 거래 관련
  lastTransaction: null,
  transactionHistory: [],

  // UI 상태
  currentError: null,
  errorMessage: "",
  isLoading: false,
};

// Actions 정의 - combine에서 get()은 최종 결합된 store를 반환
const createActions = (
  set: (partial: VendingState | Partial<VendingState> | ((state: VendingState) => VendingState | Partial<VendingState>)) => void,
  get: () => VendingState
): VendingActions => {
  // combine에서는 get()이 최종 store를 반환하므로 타입 어서션 사용
  const getStore = () => get() as VendingState & VendingActions;
  
  return {
  // ===== 기본 액션 =====

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
      status: method === "cash" ? "cash_input" : "card_process",
    });

    return { success: true };
  },

  selectProduct: (productId: ProductType): ActionResult => {
    const { status, currentBalance, products, paymentMethod } = get();

    // 음료 선택 가능한 상태인지 확인
    if (status !== "product_select" && status !== "card_process") {
      return { success: false, error: "음료를 선택할 수 없는 상태입니다." };
    }

    const product = products[productId];
    if (!product) {
      return { success: false, error: "존재하지 않는 상품입니다." };
    }

    // 재고 확인
    if (product.stock <= 0) {
      getStore().setError("out_of_stock", `${product.name}이(가) 품절되었습니다.`);
      return {
        success: false,
        error: `${product.name}이(가) 품절되었습니다.`,
      };
    }

    // 현금 결제시 잔액 확인
    if (paymentMethod === "cash" && currentBalance < product.price) {
      getStore().setError(
        "change_shortage",
        `잔액이 부족합니다. (필요: ${product.price}원, 보유: ${currentBalance}원)`
      );
      return { success: false, error: "잔액이 부족합니다." };
    }

    set({ selectedProduct: productId });

    // 결제 방식에 따라 처리 분기
    if (paymentMethod === "cash") {
      getStore().processCashTransaction(productId);
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
    set(initialState);
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

    set({
      paymentMethod: null,
      status: "idle",
      selectedProduct: null,
      currentBalance: 0,
      insertedCash: [],
      lastInsertTime: 0,
      selectedProductForCard: null,
      showPaymentConfirm: false,
    });

    getStore().clearError();
    return { success: true };
  },

  // ===== 현금 관련 액션 =====

  insertCash: (denomination: CashDenomination): ActionResult => {
    const {
      status,
      currentBalance,
      isOperational,
      insertedCash,
      lastInsertTime,
    } = get();

    set({ isLoading: true });

    try {
      // 1. 기본 검증
      if (!validateCashDenomination(denomination)) {
        return { success: false, error: "유효하지 않은 화폐 단위입니다." };
      }

      const stateValidation = validateInsertionState(status, isOperational);
      if (!stateValidation.canInsert) {
        return { success: false, error: stateValidation.reason };
      }

      // 2. 연속 투입 간격 검증 (1초 간격) - 화폐 인식 시간 시뮬레이션
      if (Date.now() - lastInsertTime < 1000) {
        // 사용자에게 화폐 반환 안내 토스트 표시
        toast.warning("화폐가 반환되었습니다. 천천히 다시 투입해주세요.");

        return {
          success: false,
          error: "너무 빠르게 투입하고 있습니다. 잠시 기다려주세요.",
        };
      }

      // 3. 정상 투입 처리
      const newBalance = currentBalance + denomination;
      const newInsertedCash = [...insertedCash, denomination];

      // 4. AdminStore의 화폐 재고 증가 (투입된 화폐를 자판기에 추가)
      const adminStore = useAdminStore.getState();
      adminStore.adjustCashCount(denomination, 1);

      set({
        currentBalance: newBalance,
        insertedCash: newInsertedCash,
        lastInsertTime: Date.now(),
        status: "product_select", // 음료 선택 가능 상태로 전환
      });

      // 5. 성공 메시지 표시
      const successMessage = formatSuccessMessage("cash_inserted", {
        amount: denomination,
        balance: newBalance,
      });
      toast.success(successMessage);

      return { success: true };
    } finally {
      set({ isLoading: false });
    }
  },

  // ===== 카드 관련 액션 =====

  // 카드 결제 확인
  confirmCardPayment: async (): Promise<ActionResult> => {
    const { selectedProductForCard, products } = get();

    if (!selectedProductForCard) {
      return { success: false, error: "선택된 상품이 없습니다." };
    }

    const product = products[selectedProductForCard];
    set({
      showPaymentConfirm: false,
      selectedProduct: selectedProductForCard,
    });

    // 실제 카드 결제 진행
    const result = await getStore().processCardPayment(product.price);
    return result;
  },

  // 카드 결제 취소
  cancelCardPayment: () => {
    set({
      selectedProductForCard: null,
      showPaymentConfirm: false,
      selectedProduct: null,
    });
  },

  // 상품별 재고 업데이트
  updateStock: (productId: ProductType, change: number) => {
    set((state: VendingState) => ({
      products: {
        ...state.products,
        [productId]: {
          ...state.products[productId],
          stock: Math.max(0, state.products[productId].stock + change),
        },
      },
    }));
  },

  processCardPayment: async (_amount: number): Promise<ActionResult> => {
    const { products, selectedProduct } = get();

    if (!selectedProduct) {
      return { success: false, error: "선택된 상품이 없습니다." };
    }

    const product = products[selectedProduct];

    set({ status: "card_process" });

    try {
      // adminStore 설정 확인
      const adminState = useAdminStore.getState();

      // 카드 인식 실패 시뮬레이션
      if (adminState.cardReaderFault) {
        toast.error("카드 인식 실패 ❌");
        throw new Error("card_reader_fault");
      }

      // 결제 거부 시뮬레이션
      if (adminState.cardPaymentReject) {
        toast.error("결제 거부 ❌");
        throw new Error("card_payment_reject");
      }

      // 결제 성공 - 거래 생성
      const transaction: Transaction = {
        id: Date.now().toString(),
        productId: selectedProduct,
        productName: product.name,
        amount: product.price,
        paymentMethod: "card",
        change: 0,
        changeBreakdown: {
          total: 0,
          denominations: { 100: 0, 500: 0, 1000: 0, 5000: 0, 10000: 0 },
          possible: true,
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
      getStore().dispenseProduct();

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "unknown_error";
      const errorType = errorMessage as ErrorType;

      getStore().setError(errorType, getErrorMessage(errorType));

      set({
        status: "product_select", // 재선택 가능
      });

      return { success: false, errorType };
    }
  },

  // ===== 배출 관련 액션 =====

  // 배출 시뮬레이션
  dispenseProduct: (): boolean => {
    const { selectedProduct, paymentMethod, products } = get();
    const adminState = useAdminStore.getState();

    if (!selectedProduct) return false;

    set({ status: "dispensing" });

    // 배출 실패 모드 체크
    if (adminState.dispenseFaultMode) {
      const product = products[selectedProduct];

      // 현금 결제인 경우 잔액 복구 및 적절한 상태 전환
      if (paymentMethod === "cash") {
        set((state: VendingState) => ({
          currentBalance: state.currentBalance + product.price, // 잔액 복구
          status: "product_select", // 다시 선택 가능 상태로
          selectedProduct: null,
        }));

        toast.error("🚫 음료 배출 실패", {
          description:
            "배출에 실패했습니다. 잔액이 복구되었습니다. 다시 선택해주세요.",
          duration: 4000,
        });
      } else {
        // 카드 결제는 별도 취소 처리가 있으므로 idle 상태로
        set({ status: "idle" });

        // 카드 결제는 기존 setError 방식 유지
        getStore().setError(
          "dispense_failure",
          "음료 배출에 실패했습니다. 잠시 후 다시 시도해주세요."
        );
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
      getStore().reset();
      return true;
    }

    // 현금 결제 후 잔액 확인 (다이어그램의 '잔액 확인' 단계)
    if (paymentMethod === "cash") {
      const { currentBalance } = get();

      // 다이어그램: 단순히 잔액이 0원인지 아닌지만 확인
      if (currentBalance > 0) {
        // 잔액이 0원이 아닌 경우 → 음료 선택 가능 상태로 (연속 구매)
        set({
          status: "product_select",
          selectedProduct: null,
        });

        toast.info(
          `잔액 ${currentBalance}원이 남아있습니다. 추가 구매가 가능합니다.`
        );
        return true;
      } else {
        // 잔액이 0원인 경우 → 대기 상태로 전환
        getStore().reset();
        return true;
      }
    }

    return true;
  },

  // ===== 내부 헬퍼 메서드 =====

  processCashTransaction: (productId: ProductType) => {
    const { products, currentBalance } = get();
    const product = products[productId];

    if (!product) return;

    // 거스름돈 계산 - 실시간 재고 사용
    const changeAmount = currentBalance - product.price;
    const adminState = useAdminStore.getState();
    const currentCashInventory = adminState.cashInventory;

    // 실제 보유 화폐로 거스름돈 계산
    const changeResult = calculateOptimalChange(
      changeAmount,
      currentCashInventory
    );

    // 거스름돈 부족 체크 (실시간 재고 기반만 사용)
    const shouldFailChange = !changeResult.possible;

    if (shouldFailChange) {
      getStore().setError(
        "change_shortage",
        "거스름돈이 부족합니다. 정확한 금액을 투입해주세요."
      );
      return;
    }

    // 거래 정보 생성 (배출 전)
    const transaction: Transaction = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      amount: product.price,
      paymentMethod: "cash",
      change: changeAmount,
      changeBreakdown: changeResult,
      timestamp: new Date(),
      status: "pending",
    };

    // 임시로 거스름돈 차감 정보 저장 (롤백용)
    const changeAdjustments: Array<{
      denomination: CashDenomination;
      count: number;
    }> = [];
    if (changeAmount > 0) {
      Object.entries(changeResult.breakdown).forEach(([denomStr, count]) => {
        const denomination = parseInt(denomStr) as CashDenomination;
        if (count > 0) {
          changeAdjustments.push({ denomination, count });
          adminState.adjustCashCount(denomination, -count);
        }
      });
    }

    set({
      lastTransaction: transaction,
      currentBalance: currentBalance - product.price, // 상품 가격만큼 차감 (거스름돈이나 0원)
      status: "dispensing",
    });

    // 배출 시도
    const dispenseSuccess = getStore().dispenseProduct();

    // 배출 실패 시 거스름돈 차감 롤백
    if (!dispenseSuccess) {
      changeAdjustments.forEach(({ denomination, count }) => {
        adminState.adjustCashCount(denomination, count); // 차감했던 거스름돈 복구
      });
    }
  },

  // ===== 유틸리티 메서드 =====

  updateProductStock: (productId: ProductType, newStock: number) => {
    const products = { ...get().products };
    if (products[productId]) {
      products[productId] = { ...products[productId], stock: newStock };
      set({ products });
    }
  },

  calculateChange: (amount: number): ChangeBreakdown => {
    const adminState = useAdminStore.getState();
    return calculateOptimalChange(amount, adminState.cashInventory);
  },

  cancelTransaction: (): ActionResult => {
    const { currentBalance } = get();

    // 현금 반환
    if (currentBalance > 0) {
      toast.success(`반환 완료! ${currentBalance}원이 반환되었습니다.`);
      getStore().reset();
    } else {
      getStore().reset();
    }

    return { success: true };
  },

  setStatus: (status: VendingStatus) => set({ status }),

  setError: (errorType: ErrorType, message?: string) => {
    const errorMessage = message || getErrorMessage(errorType);
    set({
      currentError: errorType,
      errorMessage: errorMessage,
    });

    toast.error(errorMessage);
  },

  clearError: () => set({ currentError: null, errorMessage: "" }),
  };
};

// Store 생성 (combine 사용)
export const useVendingStore = create(
  devtools(combine(initialState, createActions), {
    name: "useVendingStore", // Redux DevTools에서 표시될 이름
  })
);
