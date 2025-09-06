import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import type {
  VendingStore,
  ProductType,
  PaymentMethod,
  CashDenomination,
  Transaction,
  ChangeBreakdown,
  ErrorType,
  ActionResult,
} from "@/types";
import { PRODUCTS } from "@/constants/products";
import { calculateOptimalChange } from "@/utils/changeCalculator";
import { getErrorMessage } from "@/constants/errorMessages";
import { INITIAL_CHANGE_STOCK } from "@/constants/denominations";
import {
  validateCashDenomination,
  validateInsertionState,
} from "@/utils/validators";
import { formatSuccessMessage } from "@/utils/formatters";
import { useAdminStore } from "./adminStore";

// 초기 상태
const initialState = {
  // 기본 상태
  products: PRODUCTS,
  currentBalance: 0,
  selectedProduct: null,
  paymentMethod: null,
  status: "idle" as const,
  isOperational: true,

  // 카드 결제 관련
  selectedProductForCard: null as ProductType | null,
  showPaymentConfirm: false,
  cardInfo: null,

  // 현금 투입 관련 (새 추가)
  insertedCash: [] as CashDenomination[],
  lastInsertTime: 0,

  // 거래 관련
  lastTransaction: null,
  transactionHistory: [],

  // UI 상태
  currentError: null,
  errorMessage: "",
  isLoading: false,

};

export const useVendingStore = create<VendingStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

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
          get().setError(
            "out_of_stock",
            `${product.name}이(가) 품절되었습니다.`
          );
          return {
            success: false,
            error: `${product.name}이(가) 품절되었습니다.`,
          };
        }

        // 현금 결제시 잔액 확인
        if (paymentMethod === "cash" && currentBalance < product.price) {
          get().setError(
            "change_shortage",
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
        set({
          ...initialState,
          selectedProductForCard: null,
          showPaymentConfirm: false,
        });
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

        get().clearError();
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

          // 3. AdminStore 예외 상황 확인 (현재 사용되지 않음)

          // 4. 정상 투입 처리
          const newBalance = currentBalance + denomination;
          const newInsertedCash = [...insertedCash, denomination];

          set({
            currentBalance: newBalance,
            insertedCash: newInsertedCash,
            lastInsertTime: Date.now(),
            status: "product_select", // 음료 선택 가능 상태로 전환
          });

          // 6. 성공 메시지 표시
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

      // 카드 결제 시작
      selectCardPayment: () => {
        set({
          paymentMethod: "card",
          status: "card_process",
        });
      },

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
        const result = await get().processCardPayment(product.price);
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
        set((state) => ({
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

          // (삭제) 네트워크 오류 시뮬레이션 제거

          // 결제 거부 시뮬레이션
          if (adminState.cardPaymentReject && Math.random() < 0.15) {
            toast.error("결제 거부 ❌");
            throw new Error("card_payment_reject");
          }

          // (삭제) 관리자 개입 필요 시뮬레이션 제거

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
          await get().dispenseProduct();

          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "unknown_error";
          const errorType = errorMessage as ErrorType;

          get().setError(errorType, getErrorMessage(errorType));

          set({
            status: "product_select", // 재선택 가능
          });

          return { success: false, errorType };
        }
      },

      // ===== 배출 관련 액션 =====

      // 배출 시뮬레이션
      dispenseProduct: async (): Promise<boolean> => {
        const { selectedProduct, paymentMethod, products } = get();
        const adminState = useAdminStore.getState();

        if (!selectedProduct) return false;

        set({ status: "dispensing" });

        // (삭제) 배출구 막힘/온도 이상 시뮬레이션 제거

        // 배출 실패 모드 체크
        if (adminState.dispenseFaultMode && Math.random() < 0.3) {
          get().setError(
            "dispense_failure",
            "음료 배출에 실패했습니다. 잠시 후 다시 시도해주세요."
          );
          set({ status: "idle" });
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

        // 재고 감소 완료

        set({
          status: "completing",
          products: updatedProducts,
        });

        // 거래 완료 처리 - 이미 아래에서 toast로 처리함

        // 모든 결제 방식에서 배출 완료 토스트 표시
        toast.success(
          `${products[selectedProduct].name}이(가) 배출되었습니다! 🎉`
        );

        // 카드 결제는 바로 대기 상태로 복귀
        if (paymentMethod === "card") {
          get().reset();
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

            toast.info(`잔액 ${currentBalance}원이 남아있습니다. 추가 구매가 가능합니다.`);
            return true;
          } else {
            // 잔액이 0원인 경우 → 대기 상태로 전환
            get().reset();
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

        // 거스름돈 계산
        const changeAmount = currentBalance - product.price;
        const changeResult = calculateOptimalChange(
          changeAmount,
          INITIAL_CHANGE_STOCK
        );

        // adminStore 설정에 따른 거스름돈 부족 체크
        const adminState = useAdminStore.getState();
        const shouldFailChange =
          adminState.changeShortageMode || !changeResult.possible;

        if (shouldFailChange) {
          get().setError(
            "change_shortage",
            "거스름돈이 부족합니다. 정확한 금액을 투입해주세요."
          );
          return;
        }

        // 거래 정보 생성
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

        set({
          lastTransaction: transaction,
          currentBalance: currentBalance - product.price, // 상품 가격만큼 차감 (거스름돈이나 0원)
          status: "dispensing",
        });

        // 배출 시작
        get().dispenseProduct();
      },


      // ===== 유틸리티 메서드 =====

      updateProductStock: (productId, newStock) => {
        const products = { ...get().products };
        if (products[productId]) {
          products[productId] = { ...products[productId], stock: newStock };
          set({ products });
        }
      },

      calculateChange: (amount: number): ChangeBreakdown => {
        return calculateOptimalChange(amount, INITIAL_CHANGE_STOCK);
      },


      cancelTransaction: (): ActionResult => {
        const { currentBalance } = get();

        // 현금 반환
        if (currentBalance > 0) {
          toast.success(`💰 반환 완료! ${currentBalance}원이 반환되었습니다.`);
          get().reset();
        } else {
          get().reset();
        }

        return { success: true };
      },

      setStatus: (status) => set({ status }),

      setCardInfo: (cardInfo) => set({ cardInfo }),

      setError: (errorType: ErrorType, message?: string) => {
        const errorMessage = message || getErrorMessage(errorType);
        set({
          currentError: errorType,
          errorMessage: errorMessage,
        });

        toast.error(errorMessage);
      },

      clearError: () => set({ currentError: null, errorMessage: "" }),




      // ===== 유틸리티 메서드 =====
    }),
    {
      name: "useVendingStore", // Redux DevTools에서 표시될 이름
    }
  )
);
