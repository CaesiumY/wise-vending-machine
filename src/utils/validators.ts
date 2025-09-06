import type { ProductType, CashDenomination, ErrorType, PaymentValidationResult } from '@/types';
import { CASH_DENOMINATIONS } from '@/constants/denominations';
import { useAdminStore } from '@/stores/adminStore';
import { useVendingStore } from '@/stores/vendingStore';
import { calculateOptimalChange } from './changeCalculator';

/**
 * 유효한 화폐 단위 검증
 */
export function validateCashDenomination(amount: number): amount is CashDenomination {
  return CASH_DENOMINATIONS.includes(amount as CashDenomination);
}

/**
 * 최대 투입 금액 검증 (50,000원 제한) - 기존 호환성 유지
 */
export function validateMaxCashInput(currentAmount: number, newAmount: CashDenomination): boolean {
  const validation = validateMaxCashLimit(currentAmount, newAmount);
  return validation.isValid;
}

/**
 * 구매 가능 여부 검증 - 기존 호환성 유지 (deprecated, validatePurchase 사용 권장)
 */
export function validatePurchaseSimple(
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

// ===== Task 3: 새로운 검증 로직 =====

/**
 * 1. 재고 검증 (품절 처리)
 */
export function validateStock(
  productId: ProductType,
  requestedQuantity: number = 1
): { isValid: boolean; reason?: string; currentStock: number } {
  const vendingState = useVendingStore.getState();
  const currentStock = vendingState.products[productId]?.stock ?? 0;

  if (currentStock === 0) {
    return {
      isValid: false,
      reason: '선택하신 상품이 품절입니다. 다른 상품을 선택해주세요.',
      currentStock: 0
    };
  }

  if (currentStock < requestedQuantity) {
    return {
      isValid: false,
      reason: `재고가 부족합니다. (현재 ${currentStock}개 남음)`,
      currentStock
    };
  }

  return {
    isValid: true,
    currentStock
  };
}

/**
 * 2. 거스름돈 가능 여부 확인
 */
export function validateChangeAvailability(
  paymentAmount: number,
  productPrice: number
): PaymentValidationResult {
  const { changeShortageMode, cashInventory } = useAdminStore.getState();
  const changeRequired = paymentAmount - productPrice;

  // 거스름돈이 필요 없는 경우
  if (changeRequired === 0) {
    return {
      isValid: true,
      canProceed: true,
      requiredAmount: productPrice,
      availableChange: true
    };
  }

  // 거스름돈이 필요한 경우
  if (changeRequired > 0) {
    // 관리자 패널에서 거스름돈 부족 모드 활성화 시
    if (changeShortageMode) {
      const changeResult = calculateOptimalChange(changeRequired, cashInventory);
      
      if (!changeResult.possible) {
        return {
          isValid: false,
          reason: `거스름돈이 부족합니다. 정확한 금액 ${productPrice}원을 투입해주세요.`,
          canProceed: false,
          requiredAmount: productPrice,
          availableChange: false
        };
      }
    }

    return {
      isValid: true,
      canProceed: true,
      requiredAmount: productPrice,
      availableChange: true
    };
  }

  // 투입 금액이 부족한 경우
  return {
    isValid: false,
    reason: `${Math.abs(changeRequired)}원이 부족합니다. 추가로 투입해주세요.`,
    canProceed: false,
    requiredAmount: productPrice,
    availableChange: true
  };
}

/**
 * 3. 관리자 설정에 따른 예외 발생
 */
export function validateAdminExceptions(): {
  hasException: boolean;
  exceptionType?: ErrorType;
  message?: string;
} {
  const adminSettings = useAdminStore.getState();

  // 시스템 점검 모드 (최고 우선순위)
  if (adminSettings.systemMaintenanceMode) {
    return {
      hasException: true,
      exceptionType: 'system_maintenance',
      message: '현재 시스템 점검 중입니다. 잠시 후 이용해주세요.'
    };
  }

  // 온도 이상 모드
  if (adminSettings.temperatureErrorMode && Math.random() < 0.2) {
    return {
      hasException: true,
      exceptionType: 'temperature_error',
      message: '온도 이상으로 서비스가 제한됩니다.'
    };
  }

  // 전원 불안정 모드
  if (adminSettings.powerUnstableMode && Math.random() < 0.15) {
    return {
      hasException: true,
      exceptionType: 'power_unstable',
      message: '전원 상태가 불안정합니다. 안전 모드로 전환됩니다.'
    };
  }

  // 배출구 막힘 모드
  if (adminSettings.dispenseBlockedMode && Math.random() < 0.25) {
    return {
      hasException: true,
      exceptionType: 'dispense_blocked',
      message: '배출구가 막혔습니다. 관리자에게 문의하세요.'
    };
  }

  // 관리자 개입 필요 모드
  if (adminSettings.adminInterventionMode && Math.random() < 0.1) {
    return {
      hasException: true,
      exceptionType: 'admin_intervention',
      message: '관리자 개입이 필요합니다. 잠시만 기다려주세요.'
    };
  }

  return { hasException: false };
}

/**
 * 4. 배출 가능 여부 검증
 */
export function validateDispensing(productId: ProductType): {
  canDispense: boolean;
  reason?: string;
  errorType?: ErrorType;
} {
  // 관리자 예외 상황 체크
  const adminException = validateAdminExceptions();
  if (adminException.hasException) {
    return {
      canDispense: false,
      reason: adminException.message,
      errorType: adminException.exceptionType
    };
  }

  // 재고 검증
  const stockValidation = validateStock(productId);
  if (!stockValidation.isValid) {
    return {
      canDispense: false,
      reason: stockValidation.reason,
      errorType: 'out_of_stock'
    };
  }

  // 배출 실패 모드 체크
  const { dispenseFaultMode } = useAdminStore.getState();
  if (dispenseFaultMode && Math.random() < 0.3) {
    return {
      canDispense: false,
      reason: '음료 배출에 실패했습니다. 차액을 반환합니다.',
      errorType: 'dispense_failure'
    };
  }

  return { canDispense: true };
}

/**
 * 5. 최대 투입 금액 검증 (기존 함수 확장)
 */
export function validateMaxCashLimit(
  currentAmount: number,
  additionalAmount: CashDenomination
): { isValid: boolean; reason?: string; maxLimit: number } {
  const MAX_CASH_LIMIT = 50000; // 5만원 제한
  const totalAmount = currentAmount + additionalAmount;

  if (totalAmount > MAX_CASH_LIMIT) {
    return {
      isValid: false,
      reason: `최대 투입 가능 금액은 ${MAX_CASH_LIMIT.toLocaleString()}원입니다.`,
      maxLimit: MAX_CASH_LIMIT
    };
  }

  return {
    isValid: true,
    maxLimit: MAX_CASH_LIMIT
  };
}

/**
 * 6. 종합 구매 검증 (모든 검증을 통합)
 */
export function validatePurchase(
  productId: ProductType,
  paymentAmount: number,
  paymentMethod: 'cash' | 'card'
): PaymentValidationResult {
  const product = Object.values(useVendingStore.getState().products).find(p => p.id === productId);
  
  if (!product) {
    return {
      isValid: false,
      reason: '존재하지 않는 상품입니다.',
      canProceed: false
    };
  }

  // 1. 관리자 예외 상황 체크
  const adminException = validateAdminExceptions();
  if (adminException.hasException) {
    return {
      isValid: false,
      reason: adminException.message,
      canProceed: false
    };
  }

  // 2. 재고 검증
  const stockValidation = validateStock(productId);
  if (!stockValidation.isValid) {
    return {
      isValid: false,
      reason: stockValidation.reason,
      canProceed: false
    };
  }

  // 3. 결제 금액 검증 (현금의 경우만)
  if (paymentMethod === 'cash') {
    const changeValidation = validateChangeAvailability(paymentAmount, product.price);
    if (!changeValidation.isValid) {
      return changeValidation;
    }
  }

  // 4. 카드 결제 추가 검증
  if (paymentMethod === 'card') {
    const { networkErrorMode } = useAdminStore.getState();
    if (networkErrorMode && Math.random() < 0.3) {
      return {
        isValid: false,
        reason: '네트워크 오류가 발생했습니다. 현금 결제를 이용해주세요.',
        canProceed: false
      };
    }
  }

  return {
    isValid: true,
    canProceed: true,
    requiredAmount: product.price,
    availableChange: true
  };
}