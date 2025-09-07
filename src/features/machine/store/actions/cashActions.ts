import type { StateCreator } from "zustand";
import type { CashDenomination } from "@/features/payment/types/payment.types";
import type { ProductType } from "@/features/products/types/product.types";
import type { ActionResult, CashInsertData, RefundData, DispenseData } from "@/shared/types/utility.types";
import type { Transaction, VendingStore } from "../../types/vending.types";
import { calculateOptimalChange } from "@/features/payment/utils/changeCalculator";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { ErrorTypes } from "@/features/machine/constants/errorTypes";
import { formatCurrency } from "@/shared/utils/formatters";

// 현금 투입 간격 제한 (밀리초)
const CASH_INSERT_DELAY_MS = 1000;

// 현금 관련 액션 인터페이스
export interface CashActions {
  insertCash: (denomination: CashDenomination) => ActionResult<CashInsertData>;
  processCashTransaction: (productId: ProductType) => ActionResult<DispenseData>;
  cancelTransaction: () => ActionResult<RefundData | void>;
}

// 현금 액션 생성 함수
export const createCashActions: StateCreator<
  VendingStore,
  [],
  [],
  CashActions
> = (set, get, _api) => ({
  
  insertCash: (denomination: CashDenomination): ActionResult<CashInsertData> => {
    const state = get();
    const { currentBalance, insertedCash, lastInsertTime } = state;

    // 1. 연속 투입 간격 검증 (1초 간격) - 화폐 인식 시간 시뮬레이션
    if (Date.now() - lastInsertTime < CASH_INSERT_DELAY_MS) {
      return {
        success: false,
        error: "화폐가 반환되었습니다. 천천히 다시 투입해주세요.",
        errorType: "cashInsertTooFast",
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
      status: "productSelect", // 음료 선택 가능 상태로 전환
    });

    // 5. 성공 데이터 반환
    return { 
      success: true, 
      data: { 
        amount: denomination, 
        newBalance,
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
      currentBalance: currentBalance - product.price, // 상품 가격만큼 차감
      status: "dispensing",
    });

    // 배출 시도
    const dispenseResult = state.dispenseProduct();

    // 배출 실패 시 거스름돈 차감 롤백
    if (!dispenseResult.success) {
      changeAdjustments.forEach(({ denomination, count }) => {
        adminState.adjustCashCount(denomination, count); // 차감했던 거스름돈 복구
      });
    }
    
    // 배출 결과를 상위로 전파 (UI 컴포넌트에서 토스트 처리)
    return dispenseResult;
  },

  cancelTransaction: (): ActionResult<RefundData | void> => {
    const state = get();
    const { currentBalance } = state;

    // 현금 반환 처리
    if (currentBalance > 0) {
      state.reset();
      return { 
        success: true, 
        data: { 
          refundAmount: currentBalance,
          message: `반환 완료! ${formatCurrency(currentBalance)}이 반환되었습니다.`
        }
      };
    } else {
      state.reset();
      return { success: true };
    }
  },
});