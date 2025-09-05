import type { CashDenomination } from '@/types'

export const CASH_DENOMINATIONS: CashDenomination[] = [10000, 5000, 1000, 500, 100]

export const DENOMINATION_LABELS = {
  10000: '만원권',
  5000: '오천원권',
  1000: '천원권', 
  500: '오백원',
  100: '백원',
} as const

export const INITIAL_CHANGE_STOCK: Record<CashDenomination, number> = {
  10000: 2,
  5000: 5,
  1000: 10,
  500: 20,
  100: 50,
}