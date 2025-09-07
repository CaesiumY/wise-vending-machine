import type { StateCreator } from "zustand";
import type { CashDenomination } from "@/features/payment/types/payment.types";
import type { ProductType } from "@/features/products/types/product.types";
import type { ActionResult } from "@/shared/types/utility.types";
import type { Transaction, VendingStore } from "../../types/vending.types";
import { calculateOptimalChange } from "@/features/payment/utils/changeCalculator";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { formatCurrency } from "@/shared/utils/formatters";
import { toast } from "sonner";

// 현금 투입 간격 제한 (밀리초)
const CASH_INSERT_DELAY_MS = 1000;

// 현금 관련 액션 인터페이스
export interface CashActions {
  insertCash: (denomination: CashDenomination) => ActionResult;
  processCashTransaction: (productId: ProductType) => void;
  cancelTransaction: () => ActionResult;
}

// 현금 액션 생성 함수
export const createCashActions: StateCreator<
  VendingStore,
  [],
  [],
  CashActions
> = (set, get, _api) => ({
  
  insertCash: (denomination: CashDenomination): ActionResult => {
    const state = get();
    const { currentBalance, insertedCash, lastInsertTime } = state;

    set({ isLoading: true });

    try {
      // 1. 연속 투입 간격 검증 (1초 간격) - 화폐 인식 시간 시뮬레이션
      if (Date.now() - lastInsertTime < CASH_INSERT_DELAY_MS) {
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
        status: "productSelect", // 음료 선택 가능 상태로 전환
      });

      // 5. 성공 메시지 표시
      const successMessage = `${formatCurrency(denomination)}이 투입되었습니다.\n현재 잔액: ${formatCurrency(newBalance)}`;
      toast.success(successMessage);

      return { success: true };
    } finally {
      set({ isLoading: false });
    }
  },

  processCashTransaction: (productId: ProductType) => {
    const state = get();
    const { products, currentBalance } = state;
    const product = products[productId];

    if (!product) return;

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
      state.setError("changeShortage");
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
      currentBalance: currentBalance - product.price, // 상품 가격만큼 차감
      status: "dispensing",
    });

    // 배출 시도
    const dispenseSuccess = state.dispenseProduct();

    // 배출 실패 시 거스름돈 차감 롤백
    if (!dispenseSuccess) {
      changeAdjustments.forEach(({ denomination, count }) => {
        adminState.adjustCashCount(denomination, count); // 차감했던 거스름돈 복구
      });
    }
  },

  cancelTransaction: (): ActionResult => {
    const state = get();
    const { currentBalance } = state;

    // 현금 반환
    if (currentBalance > 0) {
      toast.success(`반환 완료! ${formatCurrency(currentBalance)}이 반환되었습니다.`);
      state.reset();
    } else {
      state.reset();
    }

    return { success: true };
  },
});