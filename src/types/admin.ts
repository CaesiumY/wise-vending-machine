import type { ProductType } from './vending'

export interface AdminSettings {
  // 결제 예외
  changeShortageMode: boolean
  changeThreshold: number
  fakeMoneyDetection: boolean
  billJamMode: boolean
  coinJamMode: boolean
  
  // 재고 관리
  stockLevels: Record<ProductType, number>
  
  // 시스템 예외
  dispenseFaultMode: boolean
  dispenseFaultRate: number
  cardReaderFault: boolean
  cardPaymentReject: boolean
  systemMaintenanceMode: boolean
  networkErrorMode: boolean
  slowResponseMode: boolean
}

export type ExceptionType = 
  | 'change_shortage'
  | 'fake_money'
  | 'bill_jam'
  | 'coin_jam'
  | 'out_of_stock'
  | 'dispense_failure'
  | 'card_reader_fault'
  | 'payment_declined'
  | 'maintenance_mode'
  | 'network_error'

export interface StockLevel {
  productId: ProductType
  level: number
  minLevel: number
}

export interface AdminPreset {
  name: string
  description: string
  settings: Partial<AdminSettings>
}