import type { ChangeBreakdown, CashDenomination } from '@/types'
import { INITIAL_CHANGE_STOCK, CASH_DENOMINATIONS } from '@/constants/denominations'

export function calculateOptimalChange(
  changeAmount: number,
  inventory = INITIAL_CHANGE_STOCK
): ChangeBreakdown {
  // 거스름돈이 0 이하인 경우
  if (changeAmount <= 0) {
    return {
      total: 0,
      denominations: {
        10000: 0,
        5000: 0,
        1000: 0,
        500: 0,
        100: 0,
      },
      possible: true,
    }
  }

  let remainingAmount = changeAmount
  const breakdown: Record<CashDenomination, number> = {
    10000: 0,
    5000: 0,
    1000: 0,
    500: 0,
    100: 0,
  }

  // 큰 단위부터 차례대로 계산
  for (const denomination of CASH_DENOMINATIONS) {
    const needed = Math.floor(remainingAmount / denomination)
    const available = inventory[denomination] || 0
    const toUse = Math.min(needed, available)
    
    breakdown[denomination] = toUse
    remainingAmount -= toUse * denomination
  }

  // 잔돈을 완전히 지급할 수 있는지 확인
  const canProvideChange = remainingAmount === 0

  return {
    total: changeAmount - remainingAmount,
    denominations: breakdown,
    possible: canProvideChange,
    shortage: canProvideChange ? undefined : CASH_DENOMINATIONS.filter(d => 
      Math.floor(remainingAmount / d) > (inventory[d] || 0)
    ),
  }
}

// 거스름돈 지급 시뮬레이션 (실제 하드웨어 제어)
export async function dispenseChange(
  breakdown: Record<CashDenomination, number>
): Promise<boolean> {
  // 실제로는 하드웨어 API 호출
  // 여기서는 시뮬레이션
  
  for (const [denomination, count] of Object.entries(breakdown)) {
    if (count > 0) {
      // 각 화폐 단위별로 배출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, count * 200))
      console.log(`${denomination}원 ${count}개 배출`)
    }
  }
  
  // 5% 확률로 배출 실패 시뮬레이션
  return Math.random() > 0.05
}