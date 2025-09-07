import type { VendingStatus } from "@/features/machine/types/vending.types";

/**
 * 상품 선택이 가능한 상태인지 확인합니다.
 */
export const isProductSelectionAllowed = (status: VendingStatus): boolean => 
  status === "productSelect" || status === "cardProcess";

/**
 * 자판기가 처리 중인 상태인지 확인합니다.
 */
export const isProcessing = (status: VendingStatus): boolean => 
  status === "dispensing" || status === "completing";

/**
 * 현금 투입이 가능한 상태인지 확인합니다.
 */
export const canInsertCash = (status: VendingStatus): boolean =>
  status === "cashInput" || status === "productSelect";

/**
 * 카드 입력 상태인지 확인합니다.
 */
export const isCardInputState = (status: VendingStatus): boolean =>
  status === "cardProcess";

/**
 * 대기 상태인지 확인합니다.
 */
export const isIdleState = (status: VendingStatus): boolean =>
  status === "idle";