import { create } from 'zustand'
import type { AdminStore, AdminSettings, ErrorType } from '@/types'

// 기본 설정값 (15가지 예외 모두 포함)
const DEFAULT_SETTINGS: AdminSettings = {
  // 💰 결제 예외 (5개)
  changeShortageMode: false,
  changeShortageThreshold: 1000,
  fakeMoneyDetectionMode: false,
  fakeMoneyDetectionRate: 10,
  billJamMode: false,
  billJamRate: 5,
  coinJamMode: false,
  coinJamRate: 3,
  
  // 📦 재고 예외
  forceOutOfStock: { cola: false, water: false, coffee: false },
  stockLevels: { cola: 5, water: 5, coffee: 5 },
  
  // 🚨 시스템 예외 (9개)
  dispenseFaultMode: false,
  dispenseFaultRate: 2,
  cardReaderFaultMode: false,
  cardPaymentRejectMode: false,
  cardPaymentRejectRate: 15,
  networkErrorMode: false,
  networkErrorRate: 10,
  systemMaintenanceMode: false,
  maxAmountExceededMode: false,
  maxAmountThreshold: 50000,
  timeoutMode: false,
  timeoutDuration: 60,
  dispenseBlockMode: false,
  temperatureErrorMode: false,
  temperatureThreshold: 25,
  powerUnstableMode: false,
  powerUnstableRate: 8,
  
  // ⚙️ UI 설정
  panelCollapsed: true,
  autoApplyChanges: true,
  showDetailedLogs: false,
  enableSoundEffects: true,
}

// 임시 기본 구현 - Phase 4에서 완전히 구현될 예정
export const useAdminStore = create<AdminStore>((set, get) => ({
  // AdminState 초기 상태
  isVisible: false,
  currentTab: 'exceptions',
  currentSettings: DEFAULT_SETTINGS,
  pendingChanges: {},
  lastAppliedPreset: null,
  monitoring: {
    uptime: 0,
    errorCount: 0,
    transactionCount: 0,
  },
  testMode: false,
  activeTests: [],
  testResults: {} as Record<ErrorType, boolean>,
  logs: [],
  maxLogs: 100,

  // AdminActions 임시 구현
  updateSetting: (key, value) => {
    const settings = { ...get().currentSettings, [key]: value }
    set({ currentSettings: settings })
    return { success: true }
  },
  resetSettings: () => {
    set({ currentSettings: DEFAULT_SETTINGS })
    return { success: true }
  },
  importSettings: (settings) => {
    const currentSettings = { ...get().currentSettings, ...settings }
    set({ currentSettings })
    return { success: true }
  },
  exportSettings: () => get().currentSettings,
  
  loadPreset: (presetName) => {
    set({ lastAppliedPreset: presetName })
    return { success: true }
  },
  createCustomPreset: (_name, _settings) => ({ success: true }),
  deleteCustomPreset: (_name) => ({ success: true }),
  
  toggleException: (_errorType) => ({ success: true }),
  testException: async (_errorType) => ({ success: true }),
  runAllTests: async () => ({} as Record<ErrorType, boolean>),
  
  setStockLevel: (productId, level) => {
    const settings = { 
      ...get().currentSettings,
      stockLevels: { ...get().currentSettings.stockLevels, [productId]: level }
    }
    set({ currentSettings: settings })
    return { success: true }
  },
  forceStockOut: (productId, enabled) => {
    const settings = {
      ...get().currentSettings,
      forceOutOfStock: { ...get().currentSettings.forceOutOfStock, [productId]: enabled }
    }
    set({ currentSettings: settings })
    return { success: true }
  },
  refillAllStock: () => ({ success: true }),
  
  togglePanel: () => set(state => ({ isVisible: !state.isVisible })),
  changeTab: (tab) => set({ currentTab: tab }),
  clearLogs: () => set({ logs: [] }),
  
  getSystemStatus: () => get().monitoring,
  resetCounters: () => set({
    monitoring: { uptime: 0, errorCount: 0, transactionCount: 0 }
  }),
  
  addLog: (entry) => {
    const logs = [...get().logs, { 
      ...entry, 
      id: Date.now().toString(), 
      timestamp: new Date() 
    }]
    set({ logs })
  },
  exportLogs: () => get().logs,
}))