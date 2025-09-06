import { useState, useCallback } from 'react';
import { useAdminStore } from '@/features/admin/store/adminStore';
import type { CashDenomination } from '@/features/payment/types/payment.types';
import type { ChangeCalculationResult } from '@/features/machine/types/vending.types';
import {
  calculateOptimalChange,
  updateCashReserveAfterChange,
  addCashToInventory,
  checkCashReserveStatus,
  generateChangeDispenseSequence
} from '@/features/payment/utils/changeCalculator';

export function useChangeCalculator() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculation, setLastCalculation] = useState<ChangeCalculationResult | null>(null);
  
  const { cashReserve, updateCashReserve } = useAdminStore();

  // 거스름돈 계산 및 지급 가능 여부 확인
  const calculateChange = useCallback(
    async (changeAmount: number): Promise<ChangeCalculationResult> => {
      setIsCalculating(true);

      try {
        // 실시간 재고 기반 계산 수행
        const result = calculateOptimalChange(changeAmount, cashReserve);
        setLastCalculation(result);
        
        return result;
        
      } finally {
        setIsCalculating(false);
      }
    },
    [cashReserve]
  );

  // 거스름돈 지급 실행 (애니메이션 포함)
  const dispenseChange = useCallback(
    async (changeAmount: number): Promise<boolean> => {
      const calculation = await calculateChange(changeAmount);
      
      if (!calculation.canProvideChange) {
        return false;
      }

      // 지급 시퀀스 생성 및 처리
      generateChangeDispenseSequence(calculation.breakdown);
      // 실제로는 하드웨어 배출 처리

      // 재고 업데이트
      const newInventory = updateCashReserveAfterChange(
        cashReserve,
        calculation.breakdown
      );
      updateCashReserve(newInventory);

      return true;
    },
    [calculateChange, cashReserve, updateCashReserve]
  );

  // 현금 투입 시 재고 추가
  const addCashToInventoryHook = useCallback(
    (denomination: CashDenomination, count: number = 1) => {
      const newInventory = addCashToInventory(cashReserve, denomination, count);
      updateCashReserve(newInventory);
    },
    [cashReserve, updateCashReserve]
  );

  // 재고 상태 확인
  const getInventoryStatus = useCallback(() => {
    return checkCashReserveStatus(cashReserve);
  }, [cashReserve]);

  return {
    calculateChange,
    dispenseChange,
    addCashToInventoryHook,
    getInventoryStatus,
    isCalculating,
    lastCalculation,
    currentReserve: cashReserve
  };
}