import { useState, useCallback } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import type { CashDenomination, ChangeCalculationResult } from '@/types';
import {
  calculateOptimalChange,
  updateCashInventoryAfterChange,
  addCashToInventory,
  checkCashInventoryStatus,
  generateChangeDispenseSequence
} from '@/utils/changeCalculator';

export function useChangeCalculator() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculation, setLastCalculation] = useState<ChangeCalculationResult | null>(null);
  
  const { cashInventory, updateCashInventory, changeShortageMode } = useAdminStore();

  // 거스름돈 계산 및 지급 가능 여부 확인
  const calculateChange = useCallback(
    async (changeAmount: number): Promise<ChangeCalculationResult> => {
      setIsCalculating(true);

      try {
        // 거스름돈 부족 모드 체크
        if (changeShortageMode) {
          // 강제로 부족 상황 시뮬레이션
          const result: ChangeCalculationResult = {
            total: 0,
            denominations: {
              10000: 0,
              5000: 0,
              1000: 0,
              500: 0,
              100: 0
            },
            possible: false,
            canProvideChange: false,
            totalChange: changeAmount,
            breakdown: {
              10000: 0,
              5000: 0,
              1000: 0,
              500: 0,
              100: 0
            },
            remainingAmount: changeAmount
          };
          
          setLastCalculation(result);
          return result;
        }

        // 실제 계산 수행
        const result = calculateOptimalChange(changeAmount, cashInventory);
        setLastCalculation(result);
        
        return result;
        
      } finally {
        setIsCalculating(false);
      }
    },
    [changeShortageMode, cashInventory]
  );

  // 거스름돈 지급 실행 (애니메이션 포함)
  const dispenseChange = useCallback(
    async (changeAmount: number): Promise<boolean> => {
      const calculation = await calculateChange(changeAmount);
      
      if (!calculation.canProvideChange) {
        return false;
      }

      // 지급 시퀀스 생성
      const sequence = generateChangeDispenseSequence(calculation.breakdown);
      
      // 애니메이션 실행
      for (const step of sequence) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
        
        // 각 단계별 알림 (선택적)
        console.log(`${step.denomination}원 ${step.count}개 배출`);
      }

      // 재고 업데이트
      const newInventory = updateCashInventoryAfterChange(
        cashInventory,
        calculation.breakdown
      );
      updateCashInventory(newInventory);

      return true;
    },
    [calculateChange, cashInventory, updateCashInventory]
  );

  // 현금 투입 시 재고 추가
  const addCashToInventoryHook = useCallback(
    (denomination: CashDenomination, count: number = 1) => {
      const newInventory = addCashToInventory(cashInventory, denomination, count);
      updateCashInventory(newInventory);
    },
    [cashInventory, updateCashInventory]
  );

  // 재고 상태 확인
  const getInventoryStatus = useCallback(() => {
    return checkCashInventoryStatus(cashInventory);
  }, [cashInventory]);

  return {
    calculateChange,
    dispenseChange,
    addCashToInventoryHook,
    getInventoryStatus,
    isCalculating,
    lastCalculation,
    currentInventory: cashInventory
  };
}