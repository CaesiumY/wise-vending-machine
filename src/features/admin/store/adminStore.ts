import { create } from "zustand";
import { combine } from "zustand/middleware";
import type { AdminSettings } from "@/features/admin/types/admin.types";
import type { CashDenomination } from "@/features/payment/types/payment.types";

// 기본 관리자 설정 (모든 예외 비활성화)
const defaultSettings: AdminSettings = {
  cardReaderFault: false,
  cardPaymentReject: false,
  dispenseFaultMode: false,
};

// 기본 화폐 보유량 (각 3개씩 - 거스름돈 부족 테스트용)
const defaultCashInventory: Record<CashDenomination, number> = {
  100: 3,
  500: 3,
  1000: 3,
  5000: 3,
  10000: 3,
};

export const useAdminStore = create(
  combine(
    {
      ...defaultSettings,
      cashInventory: defaultCashInventory,
    },
    (set) => ({
      // ===== 예외 설정 =====
      toggleException: (exception: keyof AdminSettings) => {
        set((state) => ({
          ...state,
          [exception]: !state[exception],
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
            [denomination]: Math.max(
              0,
              state.cashInventory[denomination] + change
            ),
          },
        }));
      },
    })
  )
);
