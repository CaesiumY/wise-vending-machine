import type { VendingStatus } from "@/features/machine/types/vending.types";

// 상태별 상수 정의
const PRODUCT_SELECTION_STATES: readonly VendingStatus[] = ["productSelect", "cardProcess"] as const;
const PROCESSING_STATES: readonly VendingStatus[] = ["dispensing", "completing"] as const;

/**
 * 상품 선택이 가능한 상태인지 확인합니다.
 */
export const isProductSelectionAllowed = (status: VendingStatus): boolean => 
  PRODUCT_SELECTION_STATES.includes(status);

/**
 * 자판기가 처리 중인 상태인지 확인합니다.
 */
export const isProcessing = (status: VendingStatus): boolean => 
  PROCESSING_STATES.includes(status);