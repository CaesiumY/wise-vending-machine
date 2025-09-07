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
  cancelTransaction: () => ActionResult<RefundData | void>;
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
    const product = products[productId];

    if (!product) {
      return { 
        success: false, 
        error: "상품을 찾을 수 없습니다.",
        errorType: ErrorTypes.PRODUCT_NOT_FOUND
      };
    }

    // 거스름돈 계산 - 실시간 재고 사용
    const changeAmount = currentBalance - product.price;
    const adminState = useAdminStore.getState();
    const currentCashReserve = adminState.cashReserve;

    // 실제 보유 화폐로 거스름돈 계산
    const changeResult = calculateOptimalChange(
      changeAmount,
      currentCashReserve
    );

    // 거스름돈 부족 체크 (실시간 재고 기반만 사용)
    const shouldFailChange = !changeResult.canProvideChange;

    if (shouldFailChange) {
      state.setError(ErrorTypes.CHANGE_SHORTAGE);
      return { 
        success: false, 
        error: "거스름돈이 부족합니다.",
        errorType: ErrorTypes.CHANGE_SHORTAGE 
      };
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
      currentBalance: currentBalance - product.price, // 상품 가격만큼 차감
      status: "dispensing",
    });

    // 배출 시도
    const dispenseResult = state.dispenseProduct();

    // 배출 실패 시 추가 안전장치: 사용자 자금 보호를 위한 거스름돈 복구
    if (!dispenseResult.success) {
      for (const { denomination, count } of changeAdjustments) {
        adminState.adjustCashCount(denomination, count); // 차감했던 거스름돈 복구
      }
    }
    
    return dispenseResult;
  },

  cancelTransaction: (): ActionResult<RefundData | void> => {
    const state = get();
    const { currentBalance } = state;

    // 상태 초기화는 공통으로 수행
    state.reset();

    // 잔액이 없는 경우 단순 반환
    if (currentBalance === 0) {
      return { success: true };
    }

    // 잔액이 있는 경우 반환 정보와 함께 반환
    return { 
      success: true, 
      data: { 
        refundAmount: currentBalance,
        message: `반환 완료! ${formatCurrency(currentBalance)}이 반환되었습니다.`
      }
    };
  },
});