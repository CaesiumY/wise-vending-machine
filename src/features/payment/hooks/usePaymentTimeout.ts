import { useVendingStore } from "@/features/machine/store/vendingStore";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { CARD_PAYMENT_TIMEOUT_MS, CASH_PAYMENT_TIMEOUT_MS } from "@/features/machine/store/slices/paymentSlice";
import { useState, useEffect, useRef } from "react";

/**
 * 결제 타임아웃 관련 상태 관리 hook (카드/현금 통합)
 */
export function usePaymentTimeout() {
  const { 
    setError, 
    setStatus, 
    paymentMethod, 
    paymentStartTime, 
    paymentTimeout,
    cancelTransaction
  } = useVendingStore();
  const { cardReaderFault } = useAdminStore();
  
  const [remainingTime, setRemainingTime] = useState<number>(0);
  
  const prevRemainingTimeRef = useRef<number>(0);

  const autoRecognizeCard = (): boolean => {
    if (cardReaderFault) {
      setError("cardReaderFault", "카드를 인식할 수 없습니다.");
      return false;
    }

    setStatus("cardProcess");

    return true;
  };

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
    
    if (remainingTime === 0 && prevTime > 0) {
      if (paymentMethod === 'cash') {
        cancelTransaction(true);
      }
    }
    
    prevRemainingTimeRef.current = remainingTime;
  }, [remainingTime, paymentMethod, cancelTransaction]);

  const isTimeoutWarning = remainingTime > 0 && remainingTime <= 10;

  return {
    autoRecognizeCard,
    remainingTime,
    isTimeoutWarning,
    hasActiveTimeout: paymentMethod !== null && remainingTime > 0,
  };
}
