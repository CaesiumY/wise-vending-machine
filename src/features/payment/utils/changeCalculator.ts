import type { CashDenomination } from '@/features/payment/types/payment.types'
import type { ChangeBreakdown } from '@/features/machine/types/vending.types'
import { CASH_DENOMINATIONS, EMPTY_BREAKDOWN } from '@/features/payment/constants/denominations'

/**
 * 최적 거스름돈 조합 계산 (그리디 알고리즘)
 * cashActions.ts에서 사용되는 핵심 함수
 */
export function calculateOptimalChange(
  changeAmount: number,
  inventory: Record<CashDenomination, number>
): ChangeBreakdown {
  if (changeAmount === 0) {
    return {
      canProvideChange: true,
      totalChange: 0,
      breakdown: { ...EMPTY_BREAKDOWN }
    };
  }

  const breakdown = { ...EMPTY_BREAKDOWN };

  let remainingAmount = changeAmount;

  // 큰 단위부터 차례대로 계산
  for (const denomination of CASH_DENOMINATIONS) {
    if (remainingAmount >= denomination && inventory[denomination] > 0) {
      const maxUsable = Math.min(
        Math.floor(remainingAmount / denomination), // 필요한 개수
        inventory[denomination] // 보유 개수
      );

      if (maxUsable > 0) {
        breakdown[denomination] = maxUsable;
        remainingAmount -= denomination * maxUsable;
      }
    }
  }

  const canProvideChange = remainingAmount === 0;

  return {
    canProvideChange,
    totalChange: changeAmount,
    breakdown,
    shortage: canProvideChange ? undefined : CASH_DENOMINATIONS.filter(d => 
      Math.floor(remainingAmount / d) > (inventory[d] || 0)
    ),
    remainingAmount: canProvideChange ? 0 : remainingAmount
  };
}