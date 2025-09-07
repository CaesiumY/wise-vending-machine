import { create } from "zustand";
import { combine } from "zustand/middleware";
import type { AdminSettings } from "@/features/admin/types/admin.types";
import type { CashDenomination } from "@/features/payment/types/payment.types";
import { DEFAULT_CASH_RESERVE } from "@/features/payment/constants/denominations";
import { ensureNonNegative } from "@/shared/utils/paymentHelpers";

// 기본 관리자 설정 (모든 예외 비활성화)
const defaultSettings: AdminSettings = {
  cardReaderFault: false,
  cardPaymentReject: false,
  dispenseFaultMode: false,
};

export const useAdminStore = create(
  combine(
    {
      ...defaultSettings,
      cashReserve: DEFAULT_CASH_RESERVE,
    },
    (set) => ({
      // ===== 예외 설정 =====
      // 예외 설정을 직접 값으로 설정
      setException: (exception: keyof AdminSettings, value: boolean) => {
        set({ [exception]: value });
      },

      // ===== 화폐 재고 관리 =====

      // 개별 화폐 수량 조정
      adjustCashCount: (denomination: CashDenomination, change: number) => {
        set((state) => ({
          cashReserve: {
            ...state.cashReserve,
            [denomination]: ensureNonNegative(
              state.cashReserve[denomination] + change
            ),
          },
        }));
      },
    })
  )
);
