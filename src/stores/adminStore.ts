import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { 
  TaskAdminStore, 
  TaskAdminSettings, 
  PresetName, 
  ScenarioPreset,
  ProductType,
  ErrorType,
  CashDenomination 
} from '@/types';

// 기본 관리자 설정 (모든 예외 비활성화)
const defaultSettings: TaskAdminSettings = {
  // 결제 예외 (4가지)
  changeShortageMode: false,
  fakeMoneyDetection: false,
  billJamMode: false,
  coinJamMode: false,
  
  // 재고 관리 (동적)
  stockLevels: {
    cola: 10,
    water: 15,
    coffee: 12,
  },
  
  // 시스템 예외 (10가지)
  dispenseFaultMode: false,
  cardReaderFault: false,
  cardPaymentReject: false,
  networkErrorMode: false,
  systemMaintenanceMode: false,
  timeoutMode: false,
  dispenseBlockedMode: false,
  temperatureErrorMode: false,
  powerUnstableMode: false,
  adminInterventionMode: false,
};

// 기본 화폐 보유량
const defaultCashInventory = {
  100: 50,
  500: 30,
  1000: 20,
  5000: 10,
  10000: 5,
};

// 시나리오 프리셋 정의
const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    name: 'normal',
    displayName: '정상 작동',
    description: '모든 기능이 정상적으로 작동합니다',
    settings: {
      ...defaultSettings,
      stockLevels: { cola: 10, water: 15, coffee: 12 },
    },
  },
  {
    name: 'change_shortage',
    displayName: '거스름돈 부족',
    description: '거스름돈 부족 상황을 시뮬레이션합니다',
    settings: {
      ...defaultSettings,
      changeShortageMode: true,
      stockLevels: { cola: 10, water: 15, coffee: 12 },
    },
  },
  {
    name: 'stock_shortage',
    displayName: '재고 소진',
    description: '일부 음료의 재고가 소진된 상황입니다',
    settings: {
      ...defaultSettings,
      stockLevels: { cola: 5, water: 0, coffee: 1 },
    },
  },
  {
    name: 'system_error',
    displayName: '시스템 오류',
    description: '배출 실패와 카드 오류가 발생합니다',
    settings: {
      ...defaultSettings,
      dispenseFaultMode: true,
      cardReaderFault: true,
      stockLevels: { cola: 8, water: 10, coffee: 7 },
    },
  },
  {
    name: 'worst_case',
    displayName: '최악 상황',
    description: '모든 종류의 오류가 동시에 발생합니다',
    settings: {
      changeShortageMode: true,
      fakeMoneyDetection: true,
      billJamMode: true,
      coinJamMode: true,
      dispenseFaultMode: true,
      cardReaderFault: true,
      cardPaymentReject: true,
      networkErrorMode: true,
      systemMaintenanceMode: false, // 완전 중단은 아니므로 false
      timeoutMode: true,
      dispenseBlockedMode: true,
      temperatureErrorMode: true,
      powerUnstableMode: true,
      adminInterventionMode: true,
      stockLevels: { cola: 2, water: 1, coffee: 0 },
    },
  },
];

export const useAdminStore = create<TaskAdminStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        ...defaultSettings,
        
        // UI 상태
        isPanelOpen: false,
        activePreset: 'normal',
        
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
            // stockLevels는 토글할 수 없음
            if (exception === 'stockLevels') return state;
            
            const newValue = !state[exception];
            
            // 시스템 점검 모드가 활성화되면 다른 모든 예외 비활성화
            if (exception === 'systemMaintenanceMode' && newValue) {
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

        updateStockLevel: (productId: ProductType, level: number) => {
          const clampedLevel = Math.max(0, Math.min(99, level));
          
          set((state: TaskAdminStore) => ({
            stockLevels: {
              ...state.stockLevels,
              [productId]: clampedLevel,
            },
            activePreset: null, // 수동 조정시 프리셋 해제
          }));
        },

        // 화폐 재고 업데이트 (전체 재고 교체)
        updateCashInventory: (newInventory: Record<CashDenomination, number>) => {
          set({ cashInventory: newInventory });
        },

        // 개별 화폐 수량 조정
        adjustCashCount: (denomination: CashDenomination, change: number) => {
          set(state => ({
            cashInventory: {
              ...state.cashInventory,
              [denomination]: Math.max(0, state.cashInventory[denomination] + change)
            }
          }));
        },

        // 재고 초기화 (관리자 리셋)
        resetCashInventory: () => {
          set({
            cashInventory: defaultCashInventory
          });
        },

        // ===== 프리셋 관리 =====
        
        loadPreset: (preset: PresetName) => {
          const presetData = SCENARIO_PRESETS.find(p => p.name === preset);
          
          if (!presetData) return;
          
          set({
            ...presetData.settings,
            activePreset: preset,
            // UI 상태와 모니터링 상태는 유지
          });
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
            activePreset: 'normal',
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
            change_shortage: 'changeShortageMode',
            fake_money_detected: 'fakeMoneyDetection',
            bill_jam: 'billJamMode',
            coin_jam: 'coinJamMode',
            dispense_failure: 'dispenseFaultMode',
            card_reader_fault: 'cardReaderFault',
            network_error: 'networkErrorMode',
            system_maintenance: 'systemMaintenanceMode',
            timeout_occurred: 'timeoutMode',
            dispense_blocked: 'dispenseBlockedMode',
            temperature_error: 'temperatureErrorMode',
            power_unstable: 'powerUnstableMode',
            admin_intervention: 'adminInterventionMode',
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

      }),
      {
        name: 'admin-settings', // localStorage 키
        // 민감한 정보는 저장하지 않음
        partialize: (state) => ({
          // 설정만 영구 저장
          changeShortageMode: state.changeShortageMode,
          fakeMoneyDetection: state.fakeMoneyDetection,
          billJamMode: state.billJamMode,
          coinJamMode: state.coinJamMode,
          stockLevels: state.stockLevels,
          dispenseFaultMode: state.dispenseFaultMode,
          cardReaderFault: state.cardReaderFault,
          cardPaymentReject: state.cardPaymentReject,
          networkErrorMode: state.networkErrorMode,
          systemMaintenanceMode: state.systemMaintenanceMode,
          timeoutMode: state.timeoutMode,
          dispenseBlockedMode: state.dispenseBlockedMode,
          temperatureErrorMode: state.temperatureErrorMode,
          powerUnstableMode: state.powerUnstableMode,
          adminInterventionMode: state.adminInterventionMode,
          cashInventory: state.cashInventory,
          activePreset: state.activePreset,
        }),
      }
    ),
    {
      name: 'admin-store',
    }
  )
);

// 관리자 스토어 셀렉터들
export const adminSelectors = {
  // 현재 활성 예외 목록
  getActiveExceptions: (): ErrorType[] => {
    const state = useAdminStore.getState();
    const activeExceptions: ErrorType[] = [];
    
    if (state.changeShortageMode) activeExceptions.push('change_shortage');
    if (state.fakeMoneyDetection) activeExceptions.push('fake_money_detected');
    if (state.billJamMode) activeExceptions.push('bill_jam');
    if (state.coinJamMode) activeExceptions.push('coin_jam');
    if (state.dispenseFaultMode) activeExceptions.push('dispense_failure');
    if (state.cardReaderFault) activeExceptions.push('card_reader_fault');
    if (state.cardPaymentReject) activeExceptions.push('card_payment_reject');
    if (state.networkErrorMode) activeExceptions.push('network_error');
    if (state.systemMaintenanceMode) activeExceptions.push('system_maintenance');
    if (state.timeoutMode) activeExceptions.push('timeout_occurred');
    if (state.dispenseBlockedMode) activeExceptions.push('dispense_blocked');
    if (state.temperatureErrorMode) activeExceptions.push('temperature_error');
    if (state.powerUnstableMode) activeExceptions.push('power_unstable');
    if (state.adminInterventionMode) activeExceptions.push('admin_intervention');
    
    return activeExceptions;
  },
  
  // 시스템 상태 요약
  getSystemStatus: () => {
    const state = useAdminStore.getState();
    const activeExceptions = adminSelectors.getActiveExceptions();
    
    if (state.systemMaintenanceMode) {
      return { status: 'maintenance', severity: 'critical', count: 0 };
    }
    
    if (activeExceptions.length === 0) {
      return { status: 'normal', severity: 'none', count: 0 };
    }
    
    const criticalExceptions = ['dispense_failure', 'admin_intervention'];
    const hasCritical = activeExceptions.some(e => criticalExceptions.includes(e));
    
    return {
      status: hasCritical ? 'critical' : 'warning',
      severity: hasCritical ? 'critical' : activeExceptions.length > 3 ? 'high' : 'medium',
      count: activeExceptions.length,
    };
  },
  
  // 특정 예외 발생 확률 계산
  getExceptionProbability: (type: ErrorType): number => {
    const state = useAdminStore.getState();
    
    const probabilityMap: Partial<Record<ErrorType, number>> = {
      fake_money_detected: state.fakeMoneyDetection ? 0.15 : 0.02,
      bill_jam: state.billJamMode ? 0.25 : 0.03,
      coin_jam: state.coinJamMode ? 0.20 : 0.02,
      dispense_failure: state.dispenseFaultMode ? 0.30 : 0.02,
      card_reader_fault: state.cardReaderFault ? 0.40 : 0.05,
      network_error: state.networkErrorMode ? 0.50 : 0.01,
      timeout_occurred: state.timeoutMode ? 0.20 : 0.01,
    };
    
    return probabilityMap[type] || 0;
  },
};

// 프리셋 목록 내보내기
export { SCENARIO_PRESETS };