import type { ErrorType } from "@/features/machine/types/vending.types";

/**
 * 자판기 시뮬레이터 오류 메시지 상수
 *
 * 실제로 사용되는 ErrorType에 대응하는 사용자 친화적인 오류 메시지를 정의합니다.
 * 실제 자판기에서 표시되는 안내문구를 참고하여 시뮬레이션용으로 작성되었습니다.
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  changeShortage: "거스름돈이 부족합니다.",
  outOfStock: "선택하신 음료가 품절되었습니다.",
  dispenseFailure: "음료 배출에 실패했습니다.",
  cardReaderFault: "카드를 인식할 수 없습니다.",
  cardPaymentReject: "카드 결제가 거부되었습니다.",
} as const;

/**
 * 오류 타입에 해당하는 사용자 메시지를 반환합니다.
 */
export const getErrorMessage = (errorType: ErrorType): string => {
  return ERROR_MESSAGES[errorType] || "알 수 없는 오류가 발생했습니다.";
};
