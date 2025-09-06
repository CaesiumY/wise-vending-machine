import { useState, useCallback } from 'react';
import type { ProductType } from '@/features/products/types/product.types';
import type { PaymentValidationResult } from '@/features/payment/types/payment.types';
import {
  validateStock,
  validateAdminExceptions,
  validateDispensing,
  validatePurchase
} from '@/shared/utils/validators';

export function useValidation() {
  const [lastValidation, setLastValidation] = useState<PaymentValidationResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 실시간 검증 수행
  const performValidation = useCallback(
    (productId: ProductType, amount: number, method: 'cash' | 'card') => {
      const result = validatePurchase(productId, amount, method);
      setLastValidation(result);
      
      if (!result.isValid) {
        setValidationErrors(prev => [...prev, result.reason || '알 수 없는 오류']);
      }
      
      return result;
    },
    []
  );

  // 재고 실시간 체크
  const checkStock = useCallback((productId: ProductType) => {
    return validateStock(productId);
  }, []);

  // 관리자 예외 체크
  const checkAdminExceptions = useCallback(() => {
    return validateAdminExceptions();
  }, []);

  // 배출 검증
  const checkDispensing = useCallback((productId: ProductType) => {
    return validateDispensing(productId);
  }, []);

  // 에러 초기화
  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
    setLastValidation(null);
  }, []);

  return {
    performValidation,
    checkStock,
    checkAdminExceptions,
    checkDispensing,
    clearValidationErrors,
    lastValidation,
    validationErrors,
    hasValidationErrors: validationErrors.length > 0
  };
}