import { useVendingStore } from "@/features/machine/store/vendingStore";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { PAYMENT_TIMEOUT_MS } from "@/features/machine/store/slices/paymentSlice";
import { useState, useEffect } from "react";

/**
 * 카드 결제 관련 상태 관리 hook
 */
export function useCardPayment() {
  const { 
    setError, 
    setStatus, 
    paymentMethod, 
    paymentStartTime, 
    paymentTimeout 
  } = useVendingStore();
  const { cardReaderFault } = useAdminStore();
  
  const [remainingTime, setRemainingTime] = useState<number>(0);

  const autoRecognizeCard = (): boolean => {
    if (cardReaderFault) {
      setError("cardReaderFault", "카드를 인식할 수 없습니다.");
      return false;
    }

    setStatus("cardProcess");

    return true;
  };

  // 타임아웃 모니터링 useEffect
  useEffect(() => {
    if (paymentMethod !== "card" || !paymentStartTime || !paymentTimeout) {
      setRemainingTime(0);
      return;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - paymentStartTime;
      const remaining = Math.max(0, PAYMENT_TIMEOUT_MS - elapsed);
      setRemainingTime(Math.ceil(remaining / 1000)); // 초 단위로 변환
    };

    // 즉시 실행
    updateTimer();

    // 1초마다 업데이트
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [paymentMethod, paymentStartTime, paymentTimeout]);

  // 타임아웃 경고 상태 (10초 미만일 때)
  const isTimeoutWarning = remainingTime > 0 && remainingTime <= 10;

  return {
    autoRecognizeCard,
    remainingTime,
    isTimeoutWarning,
    hasActiveTimeout: paymentMethod === "card" && remainingTime > 0,
  };
}
