import { useState } from 'react';
import { useVendingStore } from '@/stores/vendingStore';
import { useAdminStore } from '@/stores/adminStore';
import type { ProductType, CardPayment } from '@/types';

export function useCardPayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardInfo, setCardInfo] = useState<Partial<CardPayment> | null>(null);

  const {
    products,
    setError,
    setStatus,
    showDialog,
    dispenseProduct,
    updateProductStock
  } = useVendingStore();

  const {
    cardReaderFault,
    cardPaymentReject,
    networkErrorMode,
    stockLevels
  } = useAdminStore();

  // 1단계: 재고 확인 및 버튼 활성화
  const checkStockAndActivateButtons = () => {
    return Object.values(products).map(product => {
      const actualStock = stockLevels[product.id] ?? product.stock;
      return {
        ...product,
        stock: actualStock,
        isAvailable: actualStock > 0,
        reason: actualStock === 0 ? '품절' : null
      };
    });
  };

  // 2단계: 카드 인식 시뮬레이션
  const recognizeCard = async (): Promise<boolean> => {
    setStatus('card_process');
    showDialog('success', '카드 처리', '카드를 삽입해주세요...');

    try {
      // 카드 인식 시뮬레이션 (2초 대기)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 카드 리더기 오류 모드
      if (cardReaderFault && Math.random() < 0.4) {
        setError('card_reader_fault', '카드를 인식할 수 없습니다. 다시 삽입해주세요.');
        showDialog('error', '카드 인식 실패!', '카드를 다시 삽입해주세요.');
        return false;
      }

      // 정상 인식
      const mockCardInfo: Partial<CardPayment> = {
        cardType: Math.random() > 0.5 ? 'credit' : 'debit',
        cardNumber: '**** **** **** ' + Math.floor(1000 + Math.random() * 9000),
        transactionId: 'TXN' + Date.now().toString().slice(-6)
      };

      setCardInfo(mockCardInfo);
      showDialog('success', '카드 인식 완료', `카드 인식 완료\n${mockCardInfo.cardNumber}`);
      return true;

    } catch {
      setError('card_reader_fault', '카드 인식 중 오류가 발생했습니다.');
      return false;
    }
  };

  // 3단계: 결제 승인/거부 처리
  const processCardPayment = async (productId: ProductType): Promise<boolean> => {
    if (!cardInfo) return false;

    const product = products[productId];
    if (!product) return false;

    setIsProcessing(true);
    showDialog('success', '결제 처리', '결제 처리중...');

    try {
      // 네트워크 오류 시뮬레이션
      if (networkErrorMode && Math.random() < 0.3) {
        throw new Error('network_error');
      }

      // 결제 처리 시뮬레이션 (3초 대기)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 카드 결제 거부 모드
      if (cardPaymentReject && Math.random() < 0.5) {
        setError('card_payment_reject', '카드 결제가 거부되었습니다. 다른 결제 방법을 이용해주세요.');
        showDialog('error', '결제 거부!', '다른 카드 또는 현금을 이용해주세요.');
        return false;
      }

      // 결제 승인 성공
      const approvalNumber = 'AP' + Date.now().toString().slice(-6);
      
      const completedPayment: CardPayment = {
        ...cardInfo as CardPayment,
        approvalCode: approvalNumber,
        networkResponseTime: Math.floor(Math.random() * 1000) + 500
      };

      setCardInfo(completedPayment);
      
      // 재고 감소
      updateProductStock(productId, product.stock - 1);
      
      showDialog('success', '결제 승인 완료!', `결제 승인 완료!\n승인번호: ${approvalNumber}`);
      return true;

    } catch (error) {
      // 네트워크 오류 처리
      if (error instanceof Error && error.message === 'network_error') {
        setError('network_error', '네트워크 오류가 발생했습니다. 현금 결제를 이용해주세요.');
        showDialog('error', '네트워크 오류!', '현금 결제를 이용해주세요.');
      } else {
        setError('card_reader_fault', '결제 처리 중 오류가 발생했습니다.');
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // 4단계: 음료 배출 처리
  const dispenseWithCard = async (productId: ProductType): Promise<boolean> => {
    try {
      showDialog('success', '배출 진행', '음료 배출중...');
      
      // 배출 시뮬레이션
      const dispenseSuccess = await dispenseProduct();
      
      if (dispenseSuccess) {
        showDialog('success', '구매 완료', '음료가 배출되었습니다.\n감사합니다!');
        
        // 거래 완료 후 상태 초기화
        setTimeout(() => {
          resetCardPayment();
          useVendingStore.getState().reset();
        }, 3000);
        
        return true;
      } else {
        // 배출 실패 시 결제 취소
        await cancelCardPayment(productId);
        return false;
      }
    } catch {
      await cancelCardPayment(productId);
      return false;
    }
  };

  // 5단계: 결제 취소 로직
  const cancelCardPayment = async (productId: ProductType): Promise<void> => {
    setStatus('card_process');
    showDialog('error', '결제 취소', '결제를 취소합니다...');

    try {
      // 취소 처리 시뮬레이션 (2초)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 재고 복구
      const product = products[productId];
      if (product) {
        updateProductStock(productId, product.stock + 1);
      }
      
      setError('dispense_failure', '배출 실패로 인해 결제를 취소했습니다.');
      showDialog('error', '배출 실패!', '결제가 취소되었습니다.');
      
    } catch {
      setError('system_maintenance', '취소 처리 중 오류가 발생했습니다.');
    } finally {
      resetCardPayment();
    }
  };

  // 카드 결제 상태 초기화
  const resetCardPayment = () => {
    setCardInfo(null);
    setIsProcessing(false);
  };

  // 타임아웃 처리 (카드 삽입 후 60초)
  const startCardTimeout = () => {
    return setTimeout(() => {
      if (cardInfo && cardInfo.transactionId) {
        showDialog('error', '시간 초과', '시간 초과로 거래를 취소합니다.');
        resetCardPayment();
        useVendingStore.getState().reset();
      }
    }, 60000); // 60초 타임아웃
  };

  return {
    recognizeCard,
    processCardPayment,
    dispenseWithCard,
    cancelCardPayment,
    checkStockAndActivateButtons,
    startCardTimeout,
    resetCardPayment,
    isProcessing,
    cardInfo
  };
}