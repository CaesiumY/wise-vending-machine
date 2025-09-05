export type PaymentMethod = 'cash' | 'card'
export type CashDenomination = 100 | 500 | 1000 | 5000 | 10000

export interface PaymentState {
  method: PaymentMethod | null
  insertedCash: Record<CashDenomination, number>
  totalInserted: number
  cardStatus: 'idle' | 'inserted' | 'processing' | 'approved' | 'declined'
}

export interface ChangeCalculation {
  total: number
  denominations: Record<CashDenomination, number>
  possible: boolean
}