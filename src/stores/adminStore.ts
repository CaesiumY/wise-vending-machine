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
  // 결제 예외 (2가지)
  changeShortageMode: false,
  fakeMoneyDetection: false,

  // 시스템 예외 (3가지)
  cardReaderFault: false,
  cardPaymentReject: false,
  dispenseFaultMode: false,
};

// 기본 화폐 보유량
const defaultCashInventory = {
  100: 50,
  500: 30,
  1000: 20,
  5000: 10,
  10000: 5,
};


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
    set((state: TaskAdminStore) => ({
      ...state,
      [exception]: !state[exception],
      activePreset: null, // 수동 조정시 프리셋 해제
    }));
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

  saveCustomPreset: (_name: string, _settings: TaskAdminSettings) => {
    // 실제로는 서버나 로컬스토리지에 저장
    // 여기서는 시뮬레이션으로만 처리
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
      dispense_failure: "dispenseFaultMode",
      card_reader_fault: "cardReaderFault",
    };

    const settingKey = exceptionMap[type];
    if (settingKey) {
      get().toggleException(settingKey);
    }

    // 에러 기록
    get().recordError(type, `관리자가 ${type} 예외를 트리거했습니다`);
  },

  simulateNetworkDelay: async () => {
    // 네트워크 지연 시뮬레이션
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

    // 2) 카드 인식 실패
    if (state.cardReaderFault) activeExceptions.push("card_reader_fault");

    // 3) 카드 결제 실패
    if (state.cardPaymentReject) activeExceptions.push("card_payment_reject");

    // 4) 배출 실패
    if (state.dispenseFaultMode) activeExceptions.push("dispense_failure");

    return activeExceptions;
  },

  // 시스템 상태 요약
  getSystemStatus: () => {
    const activeExceptions = adminSelectors.getActiveExceptions();


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
      card_reader_fault: state.cardReaderFault ? 0.4 : 0.05,
      card_payment_reject: state.cardPaymentReject ? 0.35 : 0.03,
      dispense_failure: state.dispenseFaultMode ? 0.3 : 0.02,
    };

    return probabilityMap[type] || 0;
  },
};

// 프리셋 목록 내보내기
