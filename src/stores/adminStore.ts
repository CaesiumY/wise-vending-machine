import { create } from "zustand";
import type {
  TaskAdminStore,
  TaskAdminSettings,
  PresetName,
  // ScenarioPreset, - 향후 프리셋 기능 확장 시 사용 예정
  ErrorType,
  CashDenomination,
} from "@/types";

// 기본 관리자 설정 (모든 예외 비활성화)
const defaultSettings: TaskAdminSettings = {
  // 결제 예외 (4가지)
  changeShortageMode: false,
  fakeMoneyDetection: false,
  billJamMode: false,
  coinJamMode: false,

  // 시스템 예외 (10가지)
  dispenseFaultMode: false,
  cardReaderFault: false,
  cardPaymentReject: false,
  networkErrorMode: false, // (미사용)
  systemMaintenanceMode: false, // (미사용)
  timeoutMode: false,
  dispenseBlockedMode: false, // (미사용)
  temperatureErrorMode: false, // (미사용)
  powerUnstableMode: false, // (미사용)
  adminInterventionMode: false, // (미사용)
};

// 기본 화폐 보유량
const defaultCashInventory = {
  100: 50,
  500: 30,
  1000: 20,
  5000: 10,
  10000: 5,
};

// 시나리오 프리셋 제거됨

export const useAdminStore = create<TaskAdminStore>((set, get) => ({
  // 초기 상태
  ...defaultSettings,

  // UI 상태
  isPanelOpen: false,
  activePreset: "normal",

  // 모니터링 상태
  totalTransactions: 0,
  errorCount: 0,
  lastError: null,

  // 화폐 보유량
  cashInventory: defaultCashInventory,

  // ===== 패널 제어 =====

  togglePanel: () => {
    set((state: TaskAdminStore) => ({ isPanelOpen: !state.isPanelOpen }));
  },

  openPanel: () => {
    set({ isPanelOpen: true });
  },

  closePanel: () => {
    set({ isPanelOpen: false });
  },

  // ===== 예외 설정 =====

  toggleException: (exception: keyof TaskAdminSettings) => {
    set((state: TaskAdminStore) => {
      const newValue = !state[exception];

      // 시스템 점검 모드가 활성화되면 다른 모든 예외 비활성화
      if (exception === "systemMaintenanceMode" && newValue) {
        return {
          ...state,
          [exception]: newValue,
          activePreset: null, // 프리셋 해제
          // 다른 예외들은 유지하되, 점검 모드가 우선
        };
      }

      return {
        ...state,
        [exception]: newValue,
        activePreset: null, // 수동 조정시 프리셋 해제
      };
    });
  },

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

  loadPreset: (_preset: PresetName) => {
    // 프리셋 기능 제거: no-op
    return;
  },

  saveCustomPreset: (name: string, settings: TaskAdminSettings) => {
    // 실제로는 서버나 로컬스토리지에 저장
    // 여기서는 콘솔에만 출력
    console.log(`Custom preset "${name}" saved:`, settings);
  },

  resetToDefault: () => {
    set({
      ...defaultSettings,
      cashInventory: defaultCashInventory,
      activePreset: "normal",
      // UI 상태와 모니터링 상태는 유지
    });
  },

  // ===== 모니터링 =====

  incrementTransactionCount: () => {
    set((state: TaskAdminStore) => ({
      totalTransactions: state.totalTransactions + 1,
    }));
  },

  recordError: (type: ErrorType, message: string) => {
    set((state: TaskAdminStore) => ({
      errorCount: state.errorCount + 1,
      lastError: {
        type,
        message,
        timestamp: Date.now(),
      },
    }));
  },

  clearErrorLog: () => {
    set({
      errorCount: 0,
      lastError: null,
    });
  },

  // ===== 시뮬레이션 제어 =====

  triggerException: (type: ErrorType) => {
    // 해당 예외를 즉시 발생시키는 로직
    const exceptionMap: Partial<Record<ErrorType, keyof TaskAdminSettings>> = {
      change_shortage: "changeShortageMode",
      fake_money_detected: "fakeMoneyDetection",
      bill_jam: "billJamMode",
      coin_jam: "coinJamMode",
      dispense_failure: "dispenseFaultMode",
      card_reader_fault: "cardReaderFault",
      network_error: "networkErrorMode",
      system_maintenance: "systemMaintenanceMode",
      timeout_occurred: "timeoutMode",
      dispense_blocked: "dispenseBlockedMode",
      temperature_error: "temperatureErrorMode",
      power_unstable: "powerUnstableMode",
      admin_intervention: "adminInterventionMode",
    };

    const settingKey = exceptionMap[type];
    if (settingKey) {
      get().toggleException(settingKey);
    }

    // 에러 기록
    get().recordError(type, `관리자가 ${type} 예외를 트리거했습니다`);
  },

  simulateNetworkDelay: async () => {
    // 네트워크 지연 시뮬레이션 비활성화
    set({ networkErrorMode: true });
    set({ networkErrorMode: false });
  },
}));

// 관리자 스토어 셀렉터들
export const adminSelectors = {
  // 현재 활성 예외 목록
  getActiveExceptions: (): ErrorType[] => {
    const state = useAdminStore.getState();
    const activeExceptions: ErrorType[] = [];

    // 1) 거스름돈 부족
    if (state.changeShortageMode) activeExceptions.push("change_shortage");

    // 2) 동전/지폐 인식 실패 (bill_jam or coin_jam 둘 중 하나라도 켜져 있으면 포함)
    if (state.billJamMode || state.coinJamMode) {
      if (state.billJamMode) activeExceptions.push("bill_jam");
      if (state.coinJamMode) activeExceptions.push("coin_jam");
    }

    // 3) 카드 인식 실패
    if (state.cardReaderFault) activeExceptions.push("card_reader_fault");

    // 4) 카드 결제 실패
    if (state.cardPaymentReject) activeExceptions.push("card_payment_reject");

    // 5) 배출 실패
    if (state.dispenseFaultMode) activeExceptions.push("dispense_failure");

    // 6) 타임아웃
    if (state.timeoutMode) activeExceptions.push("timeout_occurred");

    return activeExceptions;
  },

  // 시스템 상태 요약
  getSystemStatus: () => {
    const state = useAdminStore.getState();
    const activeExceptions = adminSelectors.getActiveExceptions();

    if (state.systemMaintenanceMode) {
      return { status: "maintenance", severity: "critical", count: 0 };
    }

    if (activeExceptions.length === 0) {
      return { status: "normal", severity: "none", count: 0 };
    }

    const criticalExceptions = ["dispense_failure", "admin_intervention"];
    const hasCritical = activeExceptions.some((e) =>
      criticalExceptions.includes(e)
    );

    return {
      status: hasCritical ? "critical" : "warning",
      severity: hasCritical
        ? "critical"
        : activeExceptions.length > 3
        ? "high"
        : "medium",
      count: activeExceptions.length,
    };
  },

  // 특정 예외 발생 확률 계산 (요구된 6개 항목으로 제한)
  getExceptionProbability: (type: ErrorType): number => {
    const state = useAdminStore.getState();

    const probabilityMap: Partial<Record<ErrorType, number>> = {
      change_shortage: state.changeShortageMode ? 0.5 : 0,
      bill_jam: state.billJamMode ? 0.25 : 0.02,
      coin_jam: state.coinJamMode ? 0.2 : 0.02,
      card_reader_fault: state.cardReaderFault ? 0.4 : 0.05,
      card_payment_reject: state.cardPaymentReject ? 0.35 : 0.03,
      dispense_failure: state.dispenseFaultMode ? 0.3 : 0.02,
      timeout_occurred: state.timeoutMode ? 0.2 : 0.01,
    };

    return probabilityMap[type] || 0;
  },
};

// 프리셋 목록 내보내기
// 프리셋 제거됨
