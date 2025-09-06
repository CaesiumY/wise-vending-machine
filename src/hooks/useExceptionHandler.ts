import { useCallback } from "react";
import { useVendingStore } from "@/stores/vendingStore";
import { useAdminStore } from "@/stores/adminStore";
import { getErrorMessage } from "@/constants/errorMessages";
import type { ErrorType, ProductType, PaymentMethod } from "@/types";

interface ExceptionContext {
  productType?: ProductType;
  amount?: number;
  paymentMethod?: PaymentMethod;
  operation?: string;
}

interface ExceptionResult {
  type: ErrorType;
  message: string;
  recovery:
    | "return_money"
    | "restore_payment"
    | "use_cash"
    | "try_other_payment"
    | "request_exact_amount"
    | "auto_return"
    | "default";
  shouldBlock: boolean;
}

export function useExceptionHandler() {
  const vendingStore = useVendingStore();
  const adminStore = useAdminStore();

  // 예외 상황 체크 및 처리
  const checkExceptions = useCallback(
    (operation: string, context?: ExceptionContext): ExceptionResult[] => {
      const exceptions: ExceptionResult[] = [];
      const adminState = useAdminStore.getState();

      // 1. 거스름돈 부족 체크 (실제 계산 로직은 changeCalculator에서 처리됨)

      // 2. 품절 상황
      if (operation === "select_product" && context?.productType) {
        const vendingState = useVendingStore.getState();
        const product =
          vendingState.products[context.productType as ProductType];
        if (product && product.stock === 0) {
          exceptions.push({
            type: "out_of_stock",
            message: `${context.productType}가 품절되었습니다. 다른 음료를 선택해주세요.`,
            recovery: "default",
            shouldBlock: true,
          });
        }
      }

      // 3. 배출 실패
      if (adminState.dispenseFaultMode && operation === "dispense") {
        exceptions.push({
          type: "dispense_failure",
          message: "음료 배출에 실패했습니다. 잠시 후 다시 시도해주세요.",
          recovery: "restore_payment",
          shouldBlock: true,
        });
      }

      // 4-5. 카드 관련 오류
      if (operation === "card_recognition" && adminState.cardReaderFault) {
        exceptions.push({
          type: "card_reader_fault",
          message: "카드를 인식할 수 없습니다. 카드를 다시 삽입해주세요.",
          recovery: "try_other_payment",
          shouldBlock: true,
        });
      }

      if (operation === "card_payment" && adminState.cardPaymentReject) {
        exceptions.push({
          type: "card_payment_reject",
          message: "카드 결제가 거부되었습니다. 다른 결제 방법을 이용해주세요.",
          recovery: "try_other_payment",
          shouldBlock: true,
        });
      }


      return exceptions;
    },
    []
  );

  // 예외 처리 실행
  const handleException = useCallback(
    (exception: ExceptionResult) => {
      const { setError, setStatus, reset } = vendingStore;

      // 오류 설정 및 다이얼로그 표시
      setError(exception.type, exception.message);

      // 관리자 스토어에 오류 기록
      adminStore.recordError(exception.type, exception.message);

      // 복구 로직 실행
      switch (exception.recovery) {
        case "return_money":
        case "auto_return":
          // 투입된 금액 반환 및 취소 처리
          vendingStore.cancelTransaction();
          break;

        case "restore_payment":
          // 결제 복구 및 재고 복원
          setStatus("product_select");
          break;

        case "use_cash":
        case "try_other_payment":
          // 다른 결제 방법 안내
          setStatus("idle");
          break;

        case "request_exact_amount":
          // 정확한 금액 투입을 위해 현재 상태 유지
          break;

        default:
          // 기본 복구 동작 - 대기 상태로 복원
          reset();
          break;
      }
    },
    [vendingStore, adminStore]
  );

  // 특정 작업 전에 예외 체크
  const checkAndHandleExceptions = useCallback(
    (operation: string, context?: ExceptionContext): boolean => {
      const exceptions = checkExceptions(operation, context);

      if (exceptions.length > 0) {
        // 첫 번째 예외만 처리 (우선순위)
        handleException(exceptions[0]);
        return false; // 작업 중단
      }

      return true; // 작업 계속 진행
    },
    [checkExceptions, handleException]
  );

  // 예외 상황 강제 발생 (테스트용)
  const triggerException = useCallback(
    (errorType: ErrorType) => {
      const exception: ExceptionResult = {
        type: errorType,
        message: getErrorMessage(errorType),
        recovery: "default",
        shouldBlock: true,
      };

      handleException(exception);
    },
    [handleException]
  );

  return {
    checkExceptions,
    handleException,
    checkAndHandleExceptions,
    triggerException,
  };
}
