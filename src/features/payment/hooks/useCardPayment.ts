import { useState } from "react";
import { toast } from "sonner";
import { useVendingStore } from "@/features/machine/store/vendingStore";
import { useAdminStore } from "@/features/admin/store/adminStore";
import type { ProductType } from "@/features/products/types/product.types";

export function useCardPayment() {
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    products,
    setError,
    setStatus,
    dispenseProduct,
    updateProductStock,
  } = useVendingStore();

  const { cardReaderFault, cardPaymentReject } = useAdminStore();

  // 1단계: 재고 확인 및 버튼 활성화
  const checkStockAndActivateButtons = () => {
    return Object.values(products).map((product) => {
      return {
        ...product,
        isAvailable: product.stock > 0,
        reason: product.stock === 0 ? "품절" : null,
      };
    });
  };

  // 2단계: 카드 인식 시뮬레이션
  const recognizeCard = async (): Promise<boolean> => {
    setStatus("cardProcess");
    toast.info("💳 카드를 삽입해주세요...");

    try {
      // 카드 인식 처리

      // 카드 리더기 오류 모드
      if (cardReaderFault) {
        setError("cardReaderFault");

        // sonner 토스트로 에러 알림
        toast.error("카드 인식 실패 ❌");

        return false;
      }

      // 정상 인식
      toast.success("💳 카드 인식 완료");

      return true;
    } catch {
      setError("cardReaderFault", "카드 인식 중 오류가 발생했습니다.");
      return false;
    }
  };

  // 3단계: 결제 승인/거부 처리
  const processCardPayment = async (
    productId: ProductType
  ): Promise<boolean> => {
    const product = products[productId];
    if (!product) return false;

    setIsProcessing(true);

    // 카드 결제 진행 중 토스트 표시
    const processingToast = toast.loading("💳 카드 결제 진행 중...", {
      description: `${
        product.name
      } (${product.price.toLocaleString()}원) 결제 처리 중입니다.`,
      duration: 0, // 수동으로 닫을 때까지 유지
    });

    try {
      // 결제 처리 (즉시 처리)

      // (삭제) 네트워크 오류 시뮬레이션 제거

      // 카드 결제 거부 모드
      if (cardPaymentReject) {
        toast.dismiss(processingToast);
        setError("cardPaymentReject");

        // sonner 토스트로 결제 거부 알림
        toast.error("💳 결제 거부 ❌", {
          description:
            "카드사에서 결제를 거부했습니다. 다른 결제 방법을 이용해주세요.",
          duration: 4000,
        });

        return false;
      }

      // 재고 감소
      updateProductStock(productId, product.stock - 1);

      // 진행 중 토스트를 성공 토스트로 업데이트
      toast.dismiss(processingToast);
      toast.success("💳 결제 승인 완료! ✅", {
        description: `${product.name} 결제가 승인되었습니다.`,
        duration: 3000,
      });


      return true;
    } catch (error) {
      toast.dismiss(processingToast);

      // (단순화) 기타 오류는 카드 인식 오류로 처리
      if (error instanceof Error) {
        setError("cardReaderFault", "결제 처리 중 오류가 발생했습니다.");
        toast.error("💳 결제 처리 오류 ❌", {
          description: "결제 처리 중 문제가 발생했습니다.",
          duration: 4000,
        });
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // 4단계: 음료 배출 처리
  const dispenseWithCard = async (productId: ProductType): Promise<boolean> => {
    const product = products[productId];

    try {

      // 배출 진행 중 토스트 표시
      const dispenseToast = toast.loading("🥤 음료 배출 중...", {
        description: `${product?.name} 배출 중입니다. 잠시만 기다려주세요.`,
        duration: 0, // 수동으로 닫을 때까지 유지
      });

      // 배출 시뮬레이션
      const dispenseSuccess = dispenseProduct();

      if (dispenseSuccess) {
        // 배출 진행 토스트 닫기
        toast.dismiss(dispenseToast);


        // sonner 토스트로 최종 완료 정보 표시
        toast.success("🎉 구매 완료!", {
          description: `${product?.name} (${product?.price.toLocaleString()}원)\n\n음료를 가져가세요! 🥤`,
          duration: 6000,
        });

        // 거래 완료 후 상태 초기화
        resetCardPayment();
        useVendingStore.getState().reset();

        return true;
      } else {
        // 배출 실패 토스트 닫기
        toast.dismiss(dispenseToast);

        // 배출 실패 알림
        toast.error("🚫 음료 배출 실패", {
          description: "음료 배출에 실패했습니다. 결제가 자동으로 취소됩니다.",
          duration: 4000,
        });

        // 배출 실패 시 결제 취소
        await cancelCardPayment(productId);
        return false;
      }
    } catch {
      // 배출 실패 알림
      toast.error("🚫 시스템 오류", {
        description:
          "시스템 오류로 배출에 실패했습니다. 결제가 자동으로 취소됩니다.",
        duration: 4000,
      });

      await cancelCardPayment(productId);
      return false;
    }
  };

  // 5단계: 결제 취소 로직
  const cancelCardPayment = async (productId: ProductType): Promise<void> => {
    const product = products[productId];

    setStatus("cardProcess");

    // 결제 취소 진행 토스트
    const cancelToast = toast.loading("↩️ 결제 취소 처리 중...", {
      description: "결제를 취소하고 재고를 복구하고 있습니다.",
      duration: 0,
    });

    try {
      // 취소 처리 (즉시 처리)

      // 재고 복구
      if (product) {
        updateProductStock(productId, product.stock + 1);
      }

      // 취소 완료 토스트
      toast.dismiss(cancelToast);
      toast.info("↩️ 결제 취소 완료", {
        description: `${product?.name} 결제가 취소되었습니다.\n재고가 복구되었습니다.`,
        duration: 4000,
      });

      setError("dispenseFailure", "배출 실패로 인해 결제를 취소했습니다.");
    } catch {
      toast.dismiss(cancelToast);
      toast.error("🚫 취소 처리 오류", {
        description: "결제 취소 처리 중 문제가 발생했습니다.",
        duration: 4000,
      });
      setError("cardPaymentReject", "취소 처리 중 오류가 발생했습니다.");
    } finally {
      resetCardPayment();
    }
  };

  // 카드 결제 상태 초기화
  const resetCardPayment = () => {
    setIsProcessing(false);
  };

  // 타임아웃 처리 비활성화
  const startCardTimeout = () => {
    return null;
  };

  // 음료 선택 (결제 진행 없이 선택만)
  const selectProductForCard = (productId: ProductType) => {
    // 상태 관리를 위해 selectProduct 호출
    useVendingStore.getState().selectProduct(productId);
  };

  // 자동 카드 인식 (PaymentSelector에서 사용)
  const autoRecognizeCard = (): boolean => {
    // 카드 리더기 오류 체크
    if (cardReaderFault) {
      setError(
        "cardReaderFault", 
        "카드를 인식할 수 없습니다."
      );
      return false;
    }

    // 카드 상태로 전환
    setStatus("cardProcess");
    
    return true;
  };

  return {
    recognizeCard,
    autoRecognizeCard, // 새로운 자동 인식 메서드
    processCardPayment,
    selectProductForCard, // 새로운 메서드 추가
    dispenseWithCard,
    cancelCardPayment,
    checkStockAndActivateButtons,
    startCardTimeout,
    resetCardPayment,
    isProcessing,
  };
}