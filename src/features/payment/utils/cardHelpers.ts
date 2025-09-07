import { useVendingStore } from '@/features/machine/store/vendingStore';
import { useAdminStore } from '@/features/admin/store/adminStore';

/**
 * 카드 자동 인식 처리 유틸리티
 */
export const autoRecognizeCard = (): boolean => {
  const { cardReaderFault } = useAdminStore.getState();
  const { setError, setStatus } = useVendingStore.getState();

  if (cardReaderFault) {
    setError('cardReaderFault', '카드를 인식할 수 없습니다.');
    return false;
  }

  setStatus('cardProcess');
  return true;
};
