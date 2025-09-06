import type { CashDenomination } from '@/features/payment/types/payment.types'
import type { ErrorType } from '@/features/machine/types/vending.types'

// 간소화된 AdminSettings (3가지 예외 시뮬레이터용)
export interface AdminSettings {
  // 시스템 예외 (3가지)  
  cardReaderFault: boolean
  cardPaymentReject: boolean
  dispenseFaultMode: boolean
}

// AdminStore 타입 (Zustand 스토어용)
export interface AdminStore extends AdminSettings {
  // 모니터링 상태
  totalTransactions: number
  
  // 화폐 보유량
  cashInventory: Record<CashDenomination, number>

  // 액션들
  toggleException: (exception: keyof AdminSettings) => void
  
  // 화폐 재고 관리
  updateCashInventory: (newInventory: Record<CashDenomination, number>) => void
  adjustCashCount: (denomination: CashDenomination, change: number) => void
  resetCashInventory: () => void
  
  loadPreset: () => void
  saveCustomPreset: (name: string, settings: AdminSettings) => void
  incrementTransactionCount: () => void
  triggerException: (type: ErrorType) => void
  simulateNetworkDelay: (delayMs: number) => Promise<void>
}