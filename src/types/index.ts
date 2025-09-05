// 공통 타입들
export type { 
  ProductType, 
  PaymentMethod, 
  CashDenomination, 
  VendingStatus, 
  ErrorType, 
  TransactionStatus, 
  CardStatus, 
  DialogType, 
  PresetName,
  Nullable, 
  Optional, 
  ActionResult, 
  Timestamp, 
  ValidationResult, 
  MonitoringInfo 
} from './common'

// 자판기 관련 타입들
export type { 
  Product, 
  ChangeBreakdown, 
  Transaction, 
  DialogState, 
  VendingMachineState, 
  VendingActions, 
  VendingStore 
} from './vending'

// 결제 시스템 타입들
export type { 
  CashPayment, 
  CardPayment, 
  CashInventory, 
  ChangeCalculationResult, 
  PaymentState, 
  PaymentValidation,
  PaymentValidationResult, 
  PaymentProcessor 
} from './payment'

// 관리자 패널 타입들
export type { 
  AdminSettings, 
  TaskAdminSettings,
  TaskAdminStore,
  ExceptionToggleItem, 
  ScenarioPreset, 
  FullScenarioPreset,
  AdminState, 
  AdminLogEntry, 
  AdminActions, 
  AdminStore, 
  StockManagement, 
  SystemStatusSummary 
} from './admin'