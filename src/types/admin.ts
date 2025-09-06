import type { 
  ProductType, 
  ErrorType, 
  PresetName, 
  ActionResult, 
  Nullable, 
  MonitoringInfo,
  CashDenomination
} from './common'

// 15가지 예외 상황 설정 (완전한 관리자 설정)
export interface AdminSettings {
  // 💰 결제 예외 (5개)
  changeShortageMode: boolean           // 거스름돈 부족
  changeShortageThreshold: number       // 거스름돈 부족 임계값
  fakeMoneyDetectionMode: boolean       // 위조화폐 감지
  fakeMoneyDetectionRate: number        // 위조화폐 감지율 (0-100%)
  billJamMode: boolean                  // 지폐 걸림
  billJamRate: number                   // 지폐 걸림 발생률
  coinJamMode: boolean                  // 동전 걸림
  coinJamRate: number                   // 동전 걸림 발생률
  
  // 📦 재고 예외 (1개 + 관리)
  forceOutOfStock: Record<ProductType, boolean>  // 강제 품절 설정
  
  // 🚨 시스템 예외 (9개)
  dispenseFaultMode: boolean            // 배출 실패
  dispenseFaultRate: number             // 배출 실패율
  cardReaderFaultMode: boolean          // 카드 리더기 오류
  cardPaymentRejectMode: boolean        // 카드 결제 거부
  cardPaymentRejectRate: number         // 카드 결제 거부율
  networkErrorMode: boolean             // 네트워크 오류
  networkErrorRate: number              // 네트워크 오류율
  systemMaintenanceMode: boolean        // 시스템 점검 모드
  maxAmountExceededMode: boolean        // 최대 투입 금액 초과
  maxAmountThreshold: number            // 최대 투입 금액 설정
  timeoutMode: boolean                  // 타임아웃 강제 발생
  timeoutDuration: number               // 타임아웃 시간 (초)
  dispenseBlockMode: boolean            // 배출구 막힘
  temperatureErrorMode: boolean         // 온도 이상
  temperatureThreshold: number          // 온도 임계값
  powerUnstableMode: boolean            // 전원 불안정
  powerUnstableRate: number             // 전원 불안정 발생률
  
  // ⚙️ 관리자 UI 설정
  panelCollapsed: boolean               // 관리자 패널 접기/펼치기
  autoApplyChanges: boolean             // 설정 변경 시 자동 적용
  showDetailedLogs: boolean             // 상세 로그 표시
  enableSoundEffects: boolean           // 효과음 활성화
}

// 예외 토글 항목 정보
export interface ExceptionToggleItem {
  key: keyof AdminSettings
  label: string
  description: string
  category: 'payment' | 'stock' | 'system' | 'ui'
  enabled: boolean
  hasRate?: boolean
  rateKey?: keyof AdminSettings
  hasThreshold?: boolean
  thresholdKey?: keyof AdminSettings
}

// 5가지 시나리오 프리셋 (Task-3용)
export interface ScenarioPreset {
  name: PresetName
  displayName: string
  description: string
  settings: Partial<TaskAdminSettings>
}

// 원본 시나리오 프리셋 (기존 시스템용)
export interface FullScenarioPreset {
  name: PresetName
  displayName: string
  description: string
  icon: string
  color: string
  settings: Partial<AdminSettings>
  expectedErrors: ErrorType[]
}

// 관리자 상태 (UI + 모니터링)
export interface AdminState {
  // UI 상태
  isVisible: boolean
  currentTab: 'exceptions' | 'stock' | 'presets' | 'logs'
  
  // 설정 관리
  currentSettings: AdminSettings
  pendingChanges: Partial<AdminSettings>
  lastAppliedPreset: Nullable<PresetName>
  
  // 모니터링 정보
  monitoring: MonitoringInfo
  
  // 테스트 상태
  testMode: boolean
  activeTests: ErrorType[]
  testResults: Record<ErrorType, boolean>
  
  // 로그 관리
  logs: AdminLogEntry[]
  maxLogs: number
}

// 관리자 로그 항목
export interface AdminLogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'success'
  category: 'setting' | 'exception' | 'test' | 'system'
  message: string
  details?: unknown
}

// 관리자 액션 인터페이스
export interface AdminActions {
  // 설정 관리
  updateSetting: <K extends keyof AdminSettings>(
    key: K, 
    value: AdminSettings[K]
  ) => ActionResult
  resetSettings: () => ActionResult
  importSettings: (settings: Partial<AdminSettings>) => ActionResult
  exportSettings: () => AdminSettings
  
  // 프리셋 관리
  loadPreset: (presetName: PresetName) => ActionResult
  createCustomPreset: (name: string, settings: Partial<AdminSettings>) => ActionResult
  deleteCustomPreset: (name: string) => ActionResult
  
  // 예외 테스트
  toggleException: (errorType: ErrorType) => ActionResult
  testException: (errorType: ErrorType) => Promise<ActionResult>
  runAllTests: () => Promise<Record<ErrorType, boolean>>
  
  // 재고 관리
  setStockLevel: (productId: ProductType, level: number) => ActionResult
  forceStockOut: (productId: ProductType, enabled: boolean) => ActionResult
  refillAllStock: () => ActionResult
  
  // UI 관리
  togglePanel: () => void
  changeTab: (tab: AdminState['currentTab']) => void
  clearLogs: () => void
  
  // 모니터링
  getSystemStatus: () => MonitoringInfo
  resetCounters: () => void
  
  // 로그 관리
  addLog: (entry: Omit<AdminLogEntry, 'id' | 'timestamp'>) => void
  exportLogs: () => AdminLogEntry[]
}

// Task-3에서 사용하는 간소화된 AdminSettings (15가지 예외 시뮬레이터용)
export interface TaskAdminSettings {
  // 결제 예외 (4가지)
  changeShortageMode: boolean
  fakeMoneyDetection: boolean
  billJamMode: boolean
  coinJamMode: boolean
  
  
  // 시스템 예외 (10가지)  
  dispenseFaultMode: boolean
  cardReaderFault: boolean
  cardPaymentReject: boolean
  networkErrorMode: boolean
  systemMaintenanceMode: boolean
  timeoutMode: boolean
  dispenseBlockedMode: boolean
  temperatureErrorMode: boolean
  powerUnstableMode: boolean
  adminInterventionMode: boolean
}

// Task-3용 AdminStore 타입 (Zustand 스토어용)
export interface TaskAdminStore extends TaskAdminSettings {
  // UI 상태
  isPanelOpen: boolean
  activePreset: Nullable<PresetName>
  
  // 모니터링 상태
  totalTransactions: number
  errorCount: number
  lastError: Nullable<{
    type: ErrorType
    message: string
    timestamp: number
  }>
  
  // 화폐 보유량
  cashInventory: Record<CashDenomination, number>

  // 액션들
  togglePanel: () => void
  openPanel: () => void
  closePanel: () => void
  toggleException: (exception: keyof TaskAdminSettings) => void
  
  // 화폐 재고 관리 (Task 4 추가)
  updateCashInventory: (newInventory: Record<CashDenomination, number>) => void
  adjustCashCount: (denomination: CashDenomination, change: number) => void
  resetCashInventory: () => void
  
  loadPreset: (preset: PresetName) => void
  saveCustomPreset: (name: string, settings: TaskAdminSettings) => void
  resetToDefault: () => void
  incrementTransactionCount: () => void
  recordError: (type: ErrorType, message: string) => void
  clearErrorLog: () => void
  triggerException: (type: ErrorType) => void
  simulateNetworkDelay: (delayMs: number) => Promise<void>
}

// 기존 AdminStore 타입
export interface AdminStore extends AdminState, AdminActions {}

// 재고 관리 타입
export interface StockManagement {
  productId: ProductType
  currentLevel: number
  minLevel: number
  maxLevel: number
  autoRefill: boolean
  lastRefillDate: Nullable<Date>
  totalDispensed: number
}

// 시스템 상태 요약
export interface SystemStatusSummary {
  operationalStatus: 'online' | 'maintenance' | 'error' | 'offline'
  activeExceptions: ErrorType[]
  stockStatus: Record<ProductType, 'ok' | 'low' | 'out'>
  paymentStatus: 'operational' | 'cash_only' | 'card_only' | 'unavailable'
  lastCheck: Date
}