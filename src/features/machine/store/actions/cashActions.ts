import type { StateCreator } from "zustand";
import type { CashDenomination } from "@/features/payment/types/payment.types";
import type { ProductType } from "@/features/products/types/product.types";
import type { ActionResult, CashInsertData, RefundData, DispenseData } from "@/shared/types/utility.types";
import type { Transaction, VendingStore } from "../../types/vending.types";
import { calculateOptimalChange } from "@/features/payment/utils/changeCalculator";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { ErrorTypes } from "@/features/machine/constants/errorTypes";
import { formatCurrency } from "@/shared/utils/formatters";

const CASH_INSERT_DELAY_MS = 1000;

export interface CashActions {
  insertCash: (denomination: CashDenomination) => ActionResult<CashInsertData>;
  processCashTransaction: (productId: ProductType) => ActionResult<DispenseData>;
  cancelTransaction: (isTimeout?: boolean) => ActionResult<RefundData | void>;
}

export const createCashActions: StateCreator<
  VendingStore,
  [],
  [],
  CashActions
> = (set, get, _api) => ({
  
  insertCash: (denomination: CashDenomination): ActionResult<CashInsertData> => {
    const state = get();
    const { currentBalance, insertedCash, lastInsertTime } = state;

    // 빠른 연속 투입 방지 - 실제 자판기의 화폐 인식 시간 시뮬레이션
    if (Date.now() - lastInsertTime < CASH_INSERT_DELAY_MS) {
      return {
        success: false,
        error: "화폐가 반환되었습니다. 천천히 다시 투입해주세요.",
        errorType: ErrorTypes.CASH_INSERT_TOO_FAST,
      };
    }

    // 투입된 화폐를 자판기 재고에 즉시 반영
    const adminStore = useAdminStore.getState();
    adminStore.adjustCashCount(denomination, 1);

    const handleTimeout = () => {
      const currentState = get();
      if (currentState.paymentMethod === "cash") {
        const result = currentState.cancelTransaction(true);
        return result;
      }
    };
    if (currentBalance === 0) {
      state.startPaymentTimeout(handleTimeout, "cash");
    } else {
      state.extendPaymentTimeout(handleTimeout, "cash");
    }

    set({
      currentBalance: currentBalance + denomination,
      insertedCash: [...insertedCash, denomination],
      lastInsertTime: Date.now(),
      status: "productSelect",
    });

    return { 
      success: true, 
      data: { 
        amount: denomination, 
        newBalance: currentBalance + denomination,
        message: `${formatCurrency(denomination)}이 투입되었습니다.`
      }
    };
  },

  processCashTransaction: (productId: ProductType): ActionResult<DispenseData> => {
    const state = get();
    const { products, currentBalance } = state;

    state.clearPaymentTimeout();
    const product = products[productId];

    if (!product) {
      return { 
        success: false, 
        error: "상품을 찾을 수 없습니다.",
        errorType: ErrorTypes.PRODUCT_NOT_FOUND
      };
    }

    const changeAmount = currentBalance - product.price;
    const adminState = useAdminStore.getState();
    const currentCashReserve = adminState.cashReserve;

    const changeResult = calculateOptimalChange(
      changeAmount,
      currentCashReserve
    );
    const shouldFailChange = !changeResult.canProvideChange;

    if (shouldFailChange) {
      state.setError(ErrorTypes.CHANGE_SHORTAGE);
      return { 
        success: false, 
        error: "거스름돈이 부족합니다.",
        errorType: ErrorTypes.CHANGE_SHORTAGE 
      };
    }

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

    // 트랜잭션 안전장치: 배출 실패 시 거스름돈 복구를 위한 롤백 정보 저장
    const changeAdjustments = changeAmount > 0
      ? Object.entries(changeResult.breakdown)
          .filter(([, count]) => count > 0)
          .map(([denomStr, count]) => {
            const denomination = parseInt(denomStr) as CashDenomination;
            adminState.adjustCashCount(denomination, -count);
            return { denomination, count };
          })
      : [];

    set({
      lastTransaction: transaction,
      currentBalance: currentBalance - product.price,
      status: "dispensing",
    });

    const dispenseResult = state.dispenseProduct();

    // 배출 실패 시 추가 안전장치: 사용자 자금 보호를 위한 거스름돈 복구
    if (!dispenseResult.success) {
      for (const { denomination, count } of changeAdjustments) {
        adminState.adjustCashCount(denomination, count);
      }
    }
    
    return dispenseResult;
  },

  cancelTransaction: (isTimeout?: boolean): ActionResult<RefundData | void> => {
    const state = get();
    const { currentBalance } = state;

    state.clearPaymentTimeout();

    state.reset();

    if (currentBalance === 0) {
      return { success: true };
    }

    if (isTimeout) {
      return {
        success: false,
        error: `시간 초과로 현금이 반환되었습니다.\n반환 완료! ${formatCurrency(currentBalance)}이 반환되었습니다.`
      };
    }
    return { 
      success: true, 
      data: { 
        refundAmount: currentBalance,
        message: `반환 완료! ${formatCurrency(currentBalance)}이 반환되었습니다.`
      }
    };
  },
});