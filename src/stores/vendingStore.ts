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
import { INITIAL_CHANGE_STOCK } from "@/constants/denominations";
import {
  validateCashDenomination,
  validateMaxCashInput,
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
  dialog: { isOpen: false, type: "info" as const, title: "", message: "" },
  currentError: null,
  errorMessage: "",
  isLoading: false,

  // 타이머 관련
  timeoutId: null,
  operationStartTime: null,
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
            showPaymentConfirm: true 
          });
        }

        return { success: true };
      },

      reset: () => {
        // 타이머 정리
        get().clearTimeout();
        set({
          ...initialState,
          selectedProductForCard: null,
          showPaymentConfirm: false
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
          get().showDialog(
            "info",
            "현금 반환",
            `${currentBalance}원이 반환되었습니다.`
          );
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

          // 2. 최대 금액 검증 (50,000원 제한)
          if (!validateMaxCashInput(currentBalance, denomination)) {
            get().setError(
              "max_amount_exceeded",
              "최대 투입 금액(50,000원)을 초과했습니다."
            );
            return { success: false, errorType: "max_amount_exceeded" };
          }

          // 3. 연속 투입 간격 검증 (1초 간격)
          if (Date.now() - lastInsertTime < 1000) {
            return {
              success: false,
              error: "너무 빠르게 투입하고 있습니다. 잠시 기다려주세요.",
            };
          }

          // 4. AdminStore 예외 상황 확인
          const adminState = useAdminStore.getState();

          // 4-1. (삭제) 위조화폐 감지 로직 제거

          // 4-2. 지폐/동전 걸림 시뮬레이션
          const isBill = denomination >= 1000;
          const jamMode = isBill
            ? adminState.billJamMode
            : adminState.coinJamMode;

          if (jamMode && Math.random() < 0.25) {
            const jamType = isBill ? "bill_jam" : "coin_jam";
            get().setError(
              jamType,
              `${isBill ? "지폐" : "동전"}가 걸렸습니다. 다시 투입해주세요.`
            );
            return { success: false, errorType: jamType };
          }

          // 4-3. (삭제) 시스템 점검/전원 불안정 등 비사용 시나리오 제거

          // 5. 정상 투입 처리
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
          get().showDialog("success", "투입 완료", successMessage);

          // 7. 타임아웃 시작 (관리자 설정에 따라)
          if (adminState.timeoutMode) {
            get().startTimeout(15, () => {
              get().setError(
                "timeout_occurred",
                "시간이 초과되었습니다. 투입된 금액을 반환합니다."
              );
              get().cancelTransaction();
            });
          }

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
          selectedProduct: selectedProductForCard
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
          selectedProduct: null
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

          get().setError(errorType, get().getErrorMessage(errorType));

          set({
            status: "product_select", // 재선택 가능
          });

          return { success: false, errorType };
        }
      },

      // ===== 배출 관련 액션 =====

      // 배출 시뮬레이션
      dispenseProduct: async (): Promise<boolean> => {
        const { selectedProduct, paymentMethod, products } =
          get();
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

        // 거래 완료 처리
        get().showDialog(
          "success",
          "배출 완료",
          `${products[selectedProduct].name}이(가) 배출되었습니다.`
        );

        // 카드 결제 완료 토스트 (카드 결제일 때만)
        if (paymentMethod === "card") {
          toast.success(
            `${products[selectedProduct].name}이(가) 배출되었습니다! 🎉`,
            {
              duration: 3000,
            }
          );
          
          // 카드 결제는 바로 대기 상태로 복귀
          get().reset();
          return true;
        }

        // 현금 결제 후 잔액 확인 및 거스름돈 처리 (다이어그램의 '잔액 확인' 단계)  
        if (paymentMethod === "cash") {
          const { lastTransaction } = get();
          
          if (lastTransaction && lastTransaction.change > 0) {
            // 거스름돈이 있는 경우 - 거스름돈 반환 후 대기 상태로 (다이어그램 플로우)
            get().showDialog(
              "success",
              "거스름돈 반환",
              `거스름돈 ${lastTransaction.change}원을 받아가세요.`
            );
            
            get().reset(); // 완전 초기화 (다이어그램: 잔액 확인 → 0원일 경우 → 대기 상태)
            return true;
          } else {
            // 거스름돈이 없는 경우 (정확한 금액) - 바로 대기 상태로 
            get().reset(); // 완전 초기화
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

      completeTransaction: async (): Promise<ActionResult> => {
        const { lastTransaction, currentBalance } = get();

        if (!lastTransaction) {
          return { success: false, error: "완료할 거래가 없습니다." };
        }

        // 거래 완료 메시지 표시
        const changeMessage =
          lastTransaction.change > 0
            ? ` 거스름돈 ${lastTransaction.change}원을 받아가세요.`
            : "";

        get().showDialog(
          "success",
          "구매 완료",
          `${lastTransaction.productName}을(를) 배출했습니다.${changeMessage}`
        );

        // 거래 기록에 추가
        set((state) => ({
          transactionHistory: [
            ...state.transactionHistory,
            {
              ...lastTransaction,
              status: "success",
            },
          ],
          lastTransaction: { ...lastTransaction, status: "success" },
        }));

        // 잔액이 남아있고 최저가 음료(600원) 이상이면 연속 구매 가능
        const minPrice = Math.min(
          ...Object.values(get().products).map((p) => p.price)
        );
        if (currentBalance >= minPrice) {
          set({
            status: "product_select",
            selectedProduct: null,
          });
        } else {
          // 잔액 부족시 대기 상태로 전환
          get().reset();
        }

        return { success: true };
      },

      // ===== 기존 액션들 =====

      resetProductSelection: () => set({ selectedProduct: null }),

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

      dispenseCash: (_breakdown: ChangeBreakdown): ActionResult => {
        // 실제로는 하드웨어 제어
        // 여기서는 시뮬레이션
        return { success: true };
      },

      cancelTransaction: (): ActionResult => {
        const { currentBalance } = get();

        // 현금 반환
        if (currentBalance > 0) {
          get().showDialog(
            "info",
            "반환 완료",
            `${currentBalance}원이 반환되었습니다.`
          );
        }

        get().reset();
        return { success: true };
      },

      setStatus: (status) => set({ status }),
      
      setCardInfo: (cardInfo) => set({ cardInfo }),

      setError: (errorType: ErrorType, message?: string) => {
        const errorMessage = message || get().getErrorMessage(errorType);
        set({
          currentError: errorType,
          errorMessage: errorMessage,
        });

        get().showDialog("error", "오류 발생", errorMessage);
      },

      clearError: () => set({ currentError: null, errorMessage: "" }),

      showDialog: (type, title, message, data) =>
        set({
          dialog: { isOpen: true, type, title, message, data },
        }),

      hideDialog: () =>
        set({
          dialog: { isOpen: false, type: "info", title: "", message: "" },
        }),

      shutdown: () => set({ status: "maintenance", isOperational: false }),

      startTimeout: () => {
        // 타임아웃 기능 비활성화
      },

      clearTimeout: () => {
        const { timeoutId } = get();
        if (timeoutId) {
          window.clearTimeout(timeoutId);
          set({ timeoutId: null, operationStartTime: null });
        }
      },

      // ===== 유틸리티 메서드 =====

      getErrorMessage: (errorType: ErrorType): string => {
        const errorMessages: Record<ErrorType, string> = {
          change_shortage: "거스름돈이 부족합니다. 정확한 금액을 투입해주세요.",
          fake_money_detected: "위조화폐가 감지되었습니다. 화폐를 반환합니다.",
          bill_jam: "지폐가 걸렸습니다. 다시 투입해주세요.",
          coin_jam: "동전이 걸렸습니다. 다시 투입해주세요.",
          out_of_stock: "선택하신 음료가 품절되었습니다.",
          dispense_failure:
            "음료 배출에 실패했습니다. 잠시 후 다시 시도해주세요.",
          card_reader_fault: "카드를 인식할 수 없습니다. 다시 삽입해주세요.",
          card_payment_reject:
            "카드 결제가 거부되었습니다. 다른 카드를 사용해주세요.",
          network_error:
            "네트워크 오류가 발생했습니다. 현금 결제를 이용해주세요.",
          system_maintenance: "시스템 점검 중입니다. 잠시 후 이용해주세요.",
          max_amount_exceeded: "최대 투입 금액을 초과했습니다.",
          timeout_occurred:
            "시간이 초과되었습니다. 처음부터 다시 시도해주세요.",
          dispense_blocked: "배출구가 막혔습니다. 관리자에게 문의해주세요.",
          temperature_error: "온도 이상으로 서비스가 제한됩니다.",
          power_unstable: "전원이 불안정합니다. 잠시 후 이용해주세요.",
          admin_intervention:
            "관리자 개입이 필요합니다. 관리자에게 문의해주세요.",
        };

        return errorMessages[errorType] || "알 수 없는 오류가 발생했습니다.";
      },
    }),
    {
      name: "useVendingStore", // Redux DevTools에서 표시될 이름
    }
  )
);
