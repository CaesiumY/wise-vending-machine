import { create } from "zustand";
import { combine } from "zustand/middleware";
import type { AdminSettings } from "@/features/admin/types/admin.types";
import type { ErrorType } from "@/features/machine/types/vending.types";
import type { CashDenomination } from "@/features/payment/types/payment.types";

// 기본 관리자 설정 (모든 예외 비활성화)
const defaultSettings: AdminSettings = {
  // 시스템 예외 (3가지)
  cardReaderFault: false,
  cardPaymentReject: false,
  dispenseFaultMode: false,
};

// 기본 화폐 보유량 (각 3개씩 - 거스름돈 부족 테스트용)
const defaultCashInventory = {
  100: 3,
  500: 3,
  1000: 3,
  5000: 3,
  10000: 3,
} as const;

export const useAdminStore = create(
  combine(
    {
      // 초기 상태 - state만 정의
      ...defaultSettings,
      activePreset: "normal" as "normal" | null,
      totalTransactions: 0,
      cashInventory: defaultCashInventory as Record<CashDenomination, number>,
    },
    (set) => ({
      // Actions만 정의 - TypeScript가 자동으로 타입 추론
      
      // ===== 예외 설정 =====
      toggleException: (exception: keyof AdminSettings) => {
        set((state) => ({
          ...state,
          [exception]: !state[exception],
          activePreset: null, // 수동 조정시 프리셋 해제
        }));
      },

      // ===== 화폐 재고 관리 =====
      
      // 화폐 재고 업데이트 (전체 재고 교체)
      updateCashInventory: (newInventory: Record<CashDenomination, number>) => {
        set({ cashInventory: newInventory });
      },

      // 개별 화폐 수량 조정
      adjustCashCount: (denomination: CashDenomination, change: number) => {
        set((state) => ({
          cashInventory: {
            ...state.cashInventory,
            [denomination]: Math.max(0, state.cashInventory[denomination] + change),
          },
        }));
      },

      // 재고 초기화 (관리자 리셋)
      resetCashInventory: () => {
        set({
          cashInventory: defaultCashInventory,
        });
      },

      // ===== 프리셋 관리 =====
      
      loadPreset: () => {
        // 프리셋 기능 제거: no-op
        return;
      },

      // ===== 모니터링 =====
      
      incrementTransactionCount: () => {
        set((state) => ({
          totalTransactions: state.totalTransactions + 1,
        }));
      },

      // ===== 시뮬레이션 제어 =====
      
      triggerException: (type: ErrorType) => {
        // 해당 예외를 즉시 발생시키는 로직
        const exceptionMap: Partial<Record<ErrorType, keyof AdminSettings>> = {
          dispense_failure: "dispenseFaultMode",
          card_reader_fault: "cardReaderFault",
        };

        const settingKey = exceptionMap[type];
        if (settingKey) {
          // combine 패턴에서는 set을 직접 사용
          set((state) => ({
            ...state,
            [settingKey]: !state[settingKey],
            activePreset: null, // 수동 조정시 프리셋 해제
          }));
        }

        // 로그 출력
        console.log(`관리자가 ${type} 예외를 트리거했습니다`);
      },

    })
  )
);

// 관리자 스토어 셀렉터들
export const adminSelectors = {
  // 현재 활성 예외 목록
  getActiveExceptions: (): ErrorType[] => {
    const state = useAdminStore.getState();
    const activeExceptions: ErrorType[] = [];

    // 1) 카드 인식 실패
    if (state.cardReaderFault) activeExceptions.push("card_reader_fault");

    // 2) 카드 결제 실패
    if (state.cardPaymentReject) activeExceptions.push("card_payment_reject");

    // 3) 배출 실패
    if (state.dispenseFaultMode) activeExceptions.push("dispense_failure");

    return activeExceptions;
  },

  // 특정 예외 발생 확률 계산 (3개 시스템 예외)
  getExceptionProbability: (type: ErrorType): number => {
    const state = useAdminStore.getState();

    const probabilityMap: Partial<Record<ErrorType, number>> = {
      card_reader_fault: state.cardReaderFault ? 0.4 : 0.05,
      card_payment_reject: state.cardPaymentReject ? 0.35 : 0.03,
      dispense_failure: state.dispenseFaultMode ? 0.3 : 0.02,
    };

    return probabilityMap[type] || 0;
  },
};

// 프리셋 목록 내보내기
