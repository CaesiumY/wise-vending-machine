import type { ErrorType } from "@/types";

/**
 * 자판기 시스템 오류 메시지 상수
 *
 * 실제로 사용되는 ErrorType에 대응하는 사용자 친화적인 오류 메시지를 정의합니다.
 * 실제 자판기에서 표시되는 안내문구를 기준으로 작성되었습니다.
 */
export const ERROR_MESSAGES: Record<ErrorType, string> = {
  change_shortage: "거스름돈이 부족합니다. 정확한 금액을 투입해주세요.",
  out_of_stock: "선택하신 음료가 품절되었습니다. 다른 음료를 선택해주세요.",
  dispense_failure: "음료 배출에 실패했습니다. 잠시 후 다시 시도해주세요.",
  card_reader_fault: "카드를 인식할 수 없습니다. 카드를 다시 삽입해주세요.",
  card_payment_reject:
    "카드 결제가 거부되었습니다. 다른 결제 방법을 이용해주세요.",
} as const;

/**
 * 오류 타입에 해당하는 사용자 메시지를 반환합니다.
 */
export const getErrorMessage = (errorType: ErrorType): string => {
  return ERROR_MESSAGES[errorType] || "알 수 없는 오류가 발생했습니다.";
};
