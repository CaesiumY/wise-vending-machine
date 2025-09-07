import type { CashDenomination } from '@/features/payment/types/payment.types';

/**
 * 금액을 천 단위 구분자가 포함된 원화 형식으로 포맷팅
 * @param amount 포맷팅할 금액
 * @returns 포맷된 금액 문자열 (예: "1,100원")
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()}원`;
}

/**
 * 화폐 단위를 읽기 쉬운 형식으로 포맷팅
 * @param denomination 화폐 단위
 * @returns 포맷된 화폐 단위 문자열 (예: "1천원", "1만원")
 */
export function formatDenomination(denomination: CashDenomination): string {
  if (denomination >= 10000) {
    return `${denomination / 10000}만원`;
  }
  if (denomination >= 1000) {
    return `${denomination / 1000}천원`;
  }
  return `${denomination}원`;
}
