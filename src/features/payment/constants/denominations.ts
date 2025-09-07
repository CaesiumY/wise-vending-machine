import type { CashDenomination } from '@/features/payment/types/payment.types'

export const CASH_DENOMINATIONS: CashDenomination[] = [10000, 5000, 1000, 500, 100]

export const DEFAULT_CASH_RESERVE: Record<CashDenomination, number> = {
  100: 3,
  500: 3,
  1000: 3,
  5000: 3,
  10000: 3,
} as const

export const EMPTY_BREAKDOWN: Record<CashDenomination, number> = {
  100: 0,
  500: 0,
  1000: 0,
  5000: 0,
  10000: 0,
} as const