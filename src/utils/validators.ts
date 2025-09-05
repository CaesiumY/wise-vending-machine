import type { CashDenomination } from '@/types';
import { CASH_DENOMINATIONS } from '@/constants/denominations';

/**
 * 유효한 화폐 단위 검증
 */
export function validateCashDenomination(amount: number): amount is CashDenomination {
  return CASH_DENOMINATIONS.includes(amount as CashDenomination);
}

/**
 * 최대 투입 금액 검증 (50,000원 제한)
 */
export function validateMaxCashInput(currentAmount: number, newAmount: CashDenomination): boolean {
  const MAX_CASH_LIMIT = 50000;
  return (currentAmount + newAmount) <= MAX_CASH_LIMIT;
}

/**
 * 구매 가능 여부 검증
 */
export function validatePurchase(
  balance: number,
  productPrice: number,
  productStock: number
): { canPurchase: boolean; reason?: string } {
  if (balance < productPrice) {
    return { 
      canPurchase: false, 
      reason: `잔액이 부족합니다. (필요: ${productPrice}원, 보유: ${balance}원)` 
    };
  }
  
  if (productStock === 0) {
    return { 
      canPurchase: false, 
      reason: '선택하신 음료가 품절되었습니다.' 
    };
  }
  
  return { canPurchase: true };
}

/**
 * 위조화폐 감지 시뮬레이션
 */
export function detectFakeMoneySimulation(): boolean {
  // 실제로는 하드웨어에서 감지하지만, 시뮬레이션으로 랜덤 처리
  return Math.random() < 0.05; // 5% 확률
}

/**
 * 화폐 걸림 시뮬레이션
 */
export function simulateMoneyJam(amount: CashDenomination): boolean {
  // 지폐(1000원 이상)가 동전보다 걸릴 확률이 높음
  const jamProbability = amount >= 1000 ? 0.08 : 0.03;
  return Math.random() < jamProbability;
}

/**
 * 투입 시간 유효성 검증 (연속 투입 방지)
 */
export function validateInsertionInterval(lastInsertTime: number, minInterval = 1000): boolean {
  return Date.now() - lastInsertTime >= minInterval;
}

/**
 * 투입 가능한 상태인지 검증
 */
export function validateInsertionState(
  currentStatus: string,
  isOperational: boolean
): { canInsert: boolean; reason?: string } {
  if (!isOperational) {
    return { 
      canInsert: false, 
      reason: '자판기가 현재 서비스 중단 상태입니다.' 
    };
  }
  
  const validStates = ['idle', 'cash_input', 'product_select'];
  if (!validStates.includes(currentStatus)) {
    return { 
      canInsert: false, 
      reason: '현재 상태에서는 현금을 투입할 수 없습니다.' 
    };
  }
  
  return { canInsert: true };
}

/**
 * 화폐 단위별 투입 제한 검증
 */
export function validateDenominationLimit(
  denomination: CashDenomination,
  currentCount: number
): { canInsert: boolean; reason?: string } {
  // 화폐 단위별 최대 투입 개수 제한
  const limits: Record<CashDenomination, number> = {
    100: 20,   // 100원 최대 20개
    500: 10,   // 500원 최대 10개
    1000: 10,  // 1000원 최대 10개
    5000: 5,   // 5000원 최대 5개
    10000: 2,  // 10000원 최대 2개
  };
  
  if (currentCount >= limits[denomination]) {
    return {
      canInsert: false,
      reason: `${denomination}원권은 최대 ${limits[denomination]}개까지만 투입 가능합니다.`
    };
  }
  
  return { canInsert: true };
}

/**
 * 투입 패턴 이상 감지 (보안)
 */
export function detectSuspiciousPattern(
  insertHistory: { amount: CashDenomination; timestamp: number }[],
  timeWindow = 5000 // 5초 간격
): boolean {
  if (insertHistory.length < 3) return false;
  
  const recent = insertHistory.slice(-3);
  const timeSpan = recent[2].timestamp - recent[0].timestamp;
  
  // 5초 내 3회 이상 투입시 의심스러운 패턴으로 간주
  return timeSpan < timeWindow;
}

/**
 * 화폐 진위성 확인 시뮬레이션 (고급)
 */
export function authenticateCurrency(
  denomination: CashDenomination,
  detectionMode: boolean
): { isValid: boolean; confidence: number; reason?: string } {
  if (!detectionMode) {
    return { isValid: true, confidence: 1.0 };
  }
  
  // 시뮬레이션: 화폐 단위별 위조 확률
  const forgeryRates: Record<CashDenomination, number> = {
    100: 0.01,    // 1% 위조 확률
    500: 0.02,    // 2% 위조 확률
    1000: 0.05,   // 5% 위조 확률
    5000: 0.08,   // 8% 위조 확률
    10000: 0.12,  // 12% 위조 확률
  };
  
  const isForged = Math.random() < forgeryRates[denomination];
  
  if (isForged) {
    return {
      isValid: false,
      confidence: Math.random() * 0.5, // 낮은 신뢰도
      reason: '위조화폐로 의심됩니다.'
    };
  }
  
  return {
    isValid: true,
    confidence: 0.9 + Math.random() * 0.1, // 높은 신뢰도
  };
}