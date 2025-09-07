import { useVendingStore } from "@/features/machine/store/vendingStore";
import { CARD_PAYMENT_TIMEOUT_MS, CASH_PAYMENT_TIMEOUT_MS } from "@/features/machine/store/slices/paymentSlice";
import { useState, useEffect, useRef } from "react";

/**
 * 결제 타임아웃 관련 상태 관리 hook (카드/현금 통합)
 */
export function usePaymentTimeout() {
  const { 
    paymentMethod, 
    paymentStartTime, 
    paymentTimeout,
    cancelTransaction
  } = useVendingStore();
  
  const [remainingTime, setRemainingTime] = useState<number>(0);
  
  const prevRemainingTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!paymentMethod || !paymentStartTime || !paymentTimeout) {
      setRemainingTime(0);
      return;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - paymentStartTime;
      const timeoutMs = paymentMethod === "card" ? CARD_PAYMENT_TIMEOUT_MS : CASH_PAYMENT_TIMEOUT_MS;
      const remaining = Math.max(0, timeoutMs - elapsed);
      setRemainingTime(Math.ceil(remaining / 1000));
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [paymentMethod, paymentStartTime, paymentTimeout]);

  useEffect(() => {
    const prevTime = prevRemainingTimeRef.current;
    
    if (remainingTime !== 0 || prevTime <= 0) {
      prevRemainingTimeRef.current = remainingTime;
      return;
    }

    const { resetPaymentMethod } = useVendingStore.getState();

    if (paymentMethod === 'cash') {
      cancelTransaction(true);
      prevRemainingTimeRef.current = remainingTime;
      return;
    }

    if (paymentMethod === 'card') {
      resetPaymentMethod();
    }

    prevRemainingTimeRef.current = remainingTime;
  }, [remainingTime, paymentMethod, cancelTransaction]);

  return {
    remainingTime,
    hasActiveTimeout: paymentMethod !== null && remainingTime > 0,
  };
}
