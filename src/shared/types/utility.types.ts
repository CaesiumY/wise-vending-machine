import type { ErrorType } from "@/features/machine/types/vending.types";

// 액션 결과 데이터 타입들
export interface CashInsertData {
  amount: number;
  newBalance: number;
  message: string;
}

export interface RefundData {
  refundAmount: number;
  message: string;
}

export interface DispenseData {
  productName?: string;
  message?: string;
  paymentMethod: string;
  remainingBalance?: number;
  balanceMessage?: string;
  balanceRestored?: boolean;
  paymentCancelled?: boolean;
}

// 액션 결과 타입
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
  errorType?: ErrorType
}
