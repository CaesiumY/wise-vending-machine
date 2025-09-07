import type { PaymentMethod } from '@/features/payment/types/payment.types';

/**
 * 현금 결제 여부를 확인하는 헬퍼 함수
 * @param paymentMethod 결제 방식
 * @returns 현금 결제인지 여부
 */
export function isCashPayment(paymentMethod: PaymentMethod | null): boolean {
  return paymentMethod === "cash";
}

/**
 * 카드 결제 여부를 확인하는 헬퍼 함수
 * @param paymentMethod 결제 방식
 * @returns 카드 결제인지 여부
 */
export function isCardPayment(paymentMethod: PaymentMethod | null): boolean {
  return paymentMethod === "card";
}

/**
 * 값이 음수가 되지 않도록 보장하는 헬퍼 함수
 * @param value 확인할 값
 * @returns 0 이상의 값
 */
export function ensureNonNegative(value: number): number {
  return Math.max(0, value);
}