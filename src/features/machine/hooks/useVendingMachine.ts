import { useVendingStore } from "../store/vendingStore";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { calculateOptimalChange } from "@/features/payment/utils/changeCalculator";
import { toast } from "sonner";
import type { CashDenomination } from "@/features/payment/types/payment.types";

/**
 * 현금 결제 플로우를 위한 커스텀 훅
 */
export function useCashPayment() {
  const {
    currentBalance,
    products,
    insertCash: storeInsertCash,
    setError,
    reset,
  } = useVendingStore();

  const {
    cashReserve,
  } = useAdminStore();

  /**
   * 1단계: 화폐 인식 및 진위 확인
   */
  const insertCash = async (amount: CashDenomination): Promise<boolean> => {
    try {
      // (삭제) 위조화폐 감지 로직 제거


      // 정상 투입 처리
      const result = storeInsertCash(amount);
      if (result.success) {
        const newBalance = currentBalance + amount;
        toast.success(`${amount}원이 투입되었습니다. 현재 잔액: ${newBalance}원`);
        return true;
      }

      return false;
    } catch {
      setError("dispense_failure", "투입 처리 중 오류가 발생했습니다.");
      return false;
    }
  };

  /**
   * 2단계: 동적 버튼 활성화
   */
  const getAvailableProducts = () => {
    return Object.values(products).map((product) => ({
      ...product,
      isAvailable: currentBalance >= product.price && product.stock > 0,
      reason:
        currentBalance < product.price
          ? "잔액 부족"
          : product.stock === 0
          ? "품절"
          : null,
    }));
  };

  /**
   * 3단계: 연속 구매 기능
   */
  const checkContinuousPurchase = () => {
    const minPrice = Math.min(...Object.values(products).map((p) => p.price));
    return currentBalance >= minPrice;
  };

  /**
   * 4단계: 타임아웃 처리
   */
  const startPaymentTimeout = () => {
    // 타임아웃 기능
    return null;
  };

  /**
   * 현금 반환 로직
   */
  const returnAllCash = async (): Promise<boolean> => {
    try {
      const returnAmount = currentBalance;

      if (returnAmount <= 0) {
        return true;
      }

      // 실시간 재고 기반 거스름돈 계산
      const changeResult = calculateOptimalChange(
        returnAmount,
        cashReserve
      );

      if (!changeResult.canProvideChange) {
        setError(
          "change_shortage",
          "거스름돈이 부족합니다. 정확한 금액을 투입해주세요."
        );
        toast.error("거스름돈 부족으로 반환할 수 없습니다.");
        return false;
      }

      // 상태 초기화
      reset();

      toast.success(`반환 완료: ${returnAmount}원을 반환했습니다.`);
      return true;
    } catch {
      setError("change_shortage", "반환 처리 중 오류가 발생했습니다.");
      return false;
    }
  };

  return {
    insertCash,
    returnAllCash,
    getAvailableProducts,
    checkContinuousPurchase,
    startPaymentTimeout,
    currentBalance,
  };
}

/**
 * 관리자 기능을 위한 커스텀 훅
 */
export function useAdmin() {
  const adminStore = useAdminStore();

  return {
    ...adminStore,

    /**
     * 시스템 상태 요약 정보
     */
    getSystemSummary: () => {
      const activeExceptions = Object.entries(adminStore)
        .filter(
          ([key, value]) =>
            (typeof value === "boolean" && value && key.endsWith("Mode")) ||
            key.includes("Fault") ||
            key.includes("Detection")
        )
        .map(([key]) => key);

      return {
        isNormal: activeExceptions.length === 0,
        activeCount: activeExceptions.length,
        criticalErrors: activeExceptions.filter((key) =>
          ["dispenseFaultMode"].includes(key)
        ).length,
      };
    },

  };
}
