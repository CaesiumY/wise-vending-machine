import { create } from 'zustand'
import type { AdminSettings } from '@/types'

interface AdminStore extends AdminSettings {
  // UI State
  isAdminMode: boolean
  isPanelOpen: boolean
  
  // Actions
  toggleAdminMode: () => void
  togglePanel: () => void
  updateSettings: (settings: Partial<AdminSettings>) => void
  resetToDefaults: () => void
  loadPreset: (presetName: string) => void
}

const DEFAULT_SETTINGS: AdminSettings = {
  changeShortageMode: false,
  changeThreshold: 1000,
  fakeMoneyDetection: false,
  billJamMode: false,
  coinJamMode: false,
  stockLevels: { cola: 5, water: 5, coffee: 5 },
  dispenseFaultMode: false,
  dispenseFaultRate: 0,
  cardReaderFault: false,
  cardPaymentReject: false,
  systemMaintenanceMode: false,
  networkErrorMode: false,
  slowResponseMode: false,
}

export const useAdminStore = create<AdminStore>((set) => ({
  ...DEFAULT_SETTINGS,
  isAdminMode: false,
  isPanelOpen: false,
  
  toggleAdminMode: () => set((state) => ({ isAdminMode: !state.isAdminMode })),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
  resetToDefaults: () => set((state) => ({ ...state, ...DEFAULT_SETTINGS })),
  loadPreset: (presetName) => {
    // 프리셋 로직은 나중에 구현
    console.log('Loading preset:', presetName)
  },
}))