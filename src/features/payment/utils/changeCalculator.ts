import type { CashDenomination } from '@/features/payment/types/payment.types'
import type { ChangeCalculationResult } from '@/features/machine/types/vending.types'

// 화폐 단위 (큰 단위부터 정렬)
const DENOMINATIONS: CashDenomination[] = [10000, 5000, 1000, 500, 100];

// 1. 최적 거스름돈 조합 계산 (그리디 알고리즘)
export function calculateOptimalChange(
  changeAmount: number,
  inventory: Record<CashDenomination, number>
): ChangeCalculationResult {
  if (changeAmount === 0) {
    return {
      total: 0,
      denominations: {
        10000: 0,
        5000: 0,
        1000: 0,
        500: 0,
        100: 0
      },
      possible: true,
      canProvideChange: true,
      totalChange: 0,
      breakdown: {
        10000: 0,
        5000: 0,
        1000: 0,
        500: 0,
        100: 0
      }
    };
  }

  const breakdown = {
    10000: 0,
    5000: 0,
    1000: 0,
    500: 0,
    100: 0
  };

  let remainingAmount = changeAmount;

  // 큰 단위부터 차례대로 계산
  for (const denomination of DENOMINATIONS) {
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
    total: changeAmount - remainingAmount,
    denominations: breakdown,
    possible: canProvideChange,
    shortage: canProvideChange ? undefined : DENOMINATIONS.filter(d => 
      Math.floor(remainingAmount / d) > (inventory[d] || 0)
    ),
    remainingAmount: canProvideChange ? 0 : remainingAmount,
    canProvideChange,
    totalChange: changeAmount,
    breakdown
  };
}

// 2. 동적 프로그래밍 방식 거스름돈 계산 (더 정확하지만 복잡한 케이스용)
export function calculateOptimalChangeDP(
  changeAmount: number,
  inventory: Record<CashDenomination, number>
): ChangeCalculationResult {
  // DP 테이블: dp[i] = i원을 만들기 위한 최소 화폐 개수
  const dp = new Array(changeAmount + 1).fill(Infinity);
  const parent = new Array(changeAmount + 1).fill(-1);
  dp[0] = 0;

  // 각 화폐 단위별로 DP 테이블 업데이트
  for (const denomination of DENOMINATIONS) {
    const availableCount = inventory[denomination];
    
    for (let count = 1; count <= availableCount; count++) {
      for (let amount = changeAmount; amount >= denomination; amount--) {
        if (dp[amount - denomination] + 1 < dp[amount]) {
          dp[amount] = dp[amount - denomination] + 1;
          parent[amount] = denomination;
        }
      }
    }
  }

  // 결과 구성
  const breakdown = {
    10000: 0,
    5000: 0,
    1000: 0,
    500: 0,
    100: 0
  };

  const canProvideChange = dp[changeAmount] !== Infinity;

  if (canProvideChange) {
    // 역추적하여 사용된 화폐 개수 계산
    let current = changeAmount;
    while (current > 0 && parent[current] !== -1) {
      const denomination = parent[current] as CashDenomination;
      breakdown[denomination]++;
      current -= denomination;
    }
  }

  return {
    total: canProvideChange ? changeAmount : 0,
    denominations: breakdown,
    possible: canProvideChange,
    remainingAmount: canProvideChange ? 0 : changeAmount,
    canProvideChange,
    totalChange: changeAmount,
    breakdown
  };
}

// 3. 거스름돈 지급 후 재고 업데이트
export function updateCashReserveAfterChange(
  inventory: Record<CashDenomination, number>,
  changeBreakdown: { [K in CashDenomination]: number }
): Record<CashDenomination, number> {
  const newInventory = { ...inventory };

  for (const denomination of DENOMINATIONS) {
    const usedCount = changeBreakdown[denomination];
    newInventory[denomination] = Math.max(0, newInventory[denomination] - usedCount);
  }

  return newInventory;
}

// 4. 현금 투입 시 재고 추가
export function addCashToInventory(
  inventory: Record<CashDenomination, number>,
  denomination: CashDenomination,
  count: number = 1
): Record<CashDenomination, number> {
  return {
    ...inventory,
    [denomination]: inventory[denomination] + count
  };
}

// 5. 거스름돈 부족 상황 시뮬레이션
export function simulateChangeShortage(
  requiredChange: number,
  inventory: Record<CashDenomination, number>,
  shortageRate: number = 0.3 // 30% 확률로 부족 상황 발생
): boolean {
  // 관리자 설정에 의한 강제 부족 모드가 아닌 경우
  if (Math.random() > shortageRate) {
    return false; // 정상 지급 가능
  }

  // 실제 계산해보기
  const result = calculateOptimalChange(requiredChange, inventory);
  return !result.canProvideChange;
}

// 6. 화폐별 보유량 확인
export function checkCashReserveStatus(inventory: Record<CashDenomination, number>): {
  totalValue: number;
  totalCount: number;
  shortageWarning: boolean;
  criticalShortage: boolean;
} {
  let totalValue = 0;
  let totalCount = 0;
  let shortageCount = 0;

  for (const denomination of DENOMINATIONS) {
    const count = inventory[denomination];
    totalValue += denomination * count;
    totalCount += count;

    // 각 단위별로 5개 미만이면 부족 경고
    if (count < 5) {
      shortageCount++;
    }
  }

  return {
    totalValue,
    totalCount,
    shortageWarning: shortageCount >= 2, // 2개 이상 단위가 부족하면 경고
    criticalShortage: shortageCount >= 4  // 4개 이상 단위가 부족하면 심각
  };
}

// 7. 정확한 금액 투입 유도 계산
export function calculateExactAmountOptions(
  productPrice: number,
  currentBalance: number
): {
  needExactAmount: boolean;
  missingAmount: number;
  recommendedDenominations: CashDenomination[];
} {
  const missingAmount = Math.max(0, productPrice - currentBalance);

  if (missingAmount === 0) {
    return {
      needExactAmount: false,
      missingAmount: 0,
      recommendedDenominations: []
    };
  }

  // 필요한 금액을 만들 수 있는 최소 화폐 조합 추천
  const recommended: CashDenomination[] = [];
  let remaining = missingAmount;

  for (const denomination of DENOMINATIONS) {
    while (remaining >= denomination) {
      recommended.push(denomination);
      remaining -= denomination;
    }
  }

  return {
    needExactAmount: remaining === 0,
    missingAmount,
    recommendedDenominations: recommended
  };
}

// 8. 거스름돈 애니메이션을 위한 지급 시퀀스 생성
export function generateChangeDispenseSequence(
  breakdown: { [K in CashDenomination]: number }
): Array<{ denomination: CashDenomination; count: number; delay: number }> {
  const sequence = [];
  let cumulativeDelay = 0;

  for (const denomination of DENOMINATIONS) {
    const count = breakdown[denomination];
    if (count > 0) {
      sequence.push({
        denomination,
        count,
        delay: cumulativeDelay
      });
      
      // 큰 단위일수록 천천히 배출 (실제 자판기 느낌)
      const baseDelay = denomination >= 1000 ? 800 : 500;
      cumulativeDelay += baseDelay + (count - 1) * 200;
    }
  }

  return sequence;
}