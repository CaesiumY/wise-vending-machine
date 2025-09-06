import { useCallback } from "react";
import { useVendingStore } from "@/stores/vendingStore";
import { useAdminStore } from "@/stores/adminStore";
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
    | "maintenance_mode"
    | "safe_mode"
    | "retry_insertion"
    | "select_other"
    | "use_cash"
    | "try_other_payment"
    | "request_exact_amount"
    | "return_excess"
    | "auto_return"
    | "limited_service"
    | "service_unavailable"
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

      // 1. 거스름돈 부족 모드
      if (adminState.changeShortageMode && operation === "calculate_change") {
        exceptions.push({
          type: "change_shortage",
          message: "거스름돈이 부족합니다.",
          recovery: "request_exact_amount",
          shouldBlock: true,
        });
      }

      // (삭제) 위조화폐 감지 시나리오 제거


      // 5. 품절 상황
      if (operation === "select_product" && context?.productType) {
        const vendingState = useVendingStore.getState();
        const product =
          vendingState.products[context.productType as ProductType];
        if (product && product.stock === 0) {
          exceptions.push({
            type: "out_of_stock",
            message: `${context.productType}가 품절되었습니다. 다른 음료를 선택해주세요.`,
            recovery: "select_other",
            shouldBlock: true,
          });
        }
      }

      // 6. 배출 실패
      if (adminState.dispenseFaultMode && operation === "dispense") {
        exceptions.push({
          type: "dispense_failure",
          message: "음료 배출에 실패했습니다. 잠시 후 다시 시도해주세요.",
          recovery: "restore_payment",
          shouldBlock: true,
        });
      }

      // 7-8. 카드 관련 오류
      if (operation === "card_recognition" && adminState.cardReaderFault) {
        exceptions.push({
          type: "card_reader_fault",
          message: "카드를 인식할 수 없습니다. 카드를 다시 삽입해주세요.",
          recovery: "retry_insertion",
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

      // (삭제) 네트워크 오류 시나리오 제거

      // (삭제) 시스템 점검 시나리오 제거

      // (삭제) 최대 투입금액 초과 예외 시나리오 제거 (별도 검증 경로 유지)


      // (삭제) 배출구 막힘 시나리오 제거

      // (삭제) 온도 이상 시나리오 제거

      // (삭제) 전원 불안정 시나리오 제거

      return exceptions;
    },
    []
  );

  // 예외 처리 실행
  const handleException = useCallback(
    (exception: ExceptionResult) => {
      const { setError, setStatus, reset, currentBalance } = vendingStore;

      // 오류 설정 및 다이얼로그 표시
      setError(exception.type, exception.message);

      // 관리자 스토어에 오류 기록
      adminStore.recordError(exception.type, exception.message);

      // 복구 로직 실행
      switch (exception.recovery) {
        case "return_money":
          // 투입된 금액 반환 로직
          if (currentBalance > 0) {
            vendingStore.showDialog(
              "info",
              "반환 완료",
              `${currentBalance}원이 반환되었습니다.`
            );
          }
          reset();
          break;

        case "restore_payment":
          // 결제 복구 및 재고 복원
          setStatus("product_select");
          vendingStore.showDialog(
            "info",
            "결제 복구",
            "결제를 취소하고 금액을 복구했습니다."
          );
          break;

        case "maintenance_mode":
        case "safe_mode":
          setStatus("maintenance");
          vendingStore.shutdown();
          break;

        case "use_cash":
          // 카드 결제 비활성화, 현금 결제로 유도
          setStatus("idle");
          vendingStore.showDialog(
            "info",
            "결제 방법 안내",
            "현금 결제를 이용해주세요."
          );
          break;

        case "try_other_payment":
          // 다른 카드 사용 안내
          setStatus("product_select");
          break;

        case "request_exact_amount":
          // 정확한 금액 투입 안내
          vendingStore.showDialog(
            "info",
            "정확한 금액",
            "정확한 금액을 투입해주세요."
          );
          break;

        case "auto_return":
          // 자동 반환 처리
          vendingStore.cancelTransaction();
          break;

        case "limited_service":
          // 서비스 제한 안내
          vendingStore.showDialog(
            "error",
            "서비스 제한",
            "일부 기능이 제한될 수 있습니다."
          );
          break;

        case "service_unavailable":
          // 서비스 중단
          setStatus("maintenance");
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
        message: vendingStore.getErrorMessage(errorType),
        recovery: "default",
        shouldBlock: true,
      };

      handleException(exception);
    },
    [handleException, vendingStore]
  );

  return {
    checkExceptions,
    handleException,
    checkAndHandleExceptions,
    triggerException,
  };
}
