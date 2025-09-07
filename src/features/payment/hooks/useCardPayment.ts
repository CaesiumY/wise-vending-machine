import { useVendingStore } from "@/features/machine/store/vendingStore";
import { useAdminStore } from "@/features/admin/store/adminStore";

/**
 * 카드 결제 관련 상태 관리 hook
 */
export function useCardPayment() {
  const { setError, setStatus } = useVendingStore();
  const { cardReaderFault } = useAdminStore();

  const autoRecognizeCard = (): boolean => {
    if (cardReaderFault) {
      setError("cardReaderFault", "카드를 인식할 수 없습니다.");
      return false;
    }

    setStatus("cardProcess");

    return true;
  };

  return {
    autoRecognizeCard,
  };
}
