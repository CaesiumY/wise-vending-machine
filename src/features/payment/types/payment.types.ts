// 결제 관련 기본 타입들
export type PaymentMethod = 'cash' | 'card'
export type CashDenomination = 100 | 500 | 1000 | 5000 | 10000
export type TransactionStatus = 'pending'

// 자판기 화폐 보유량 (거스름돈용)
export type CashReserve = Record<CashDenomination, number>
