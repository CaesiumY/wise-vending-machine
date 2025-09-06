import { useVendingStore } from "@/features/machine/store/vendingStore";
import type { 
  Product, 
  ButtonStateType, 
  VendingContext 
} from "../types/product.types";
import { ButtonState } from "../types/product.types";

/**
 * 상품의 버튼 상태를 결정하는 순수 함수
 * @param product 상품 정보
 * @param context 자판기 상태 컨텍스트
 * @returns 버튼 상태
 */
export const getProductState = (
  product: Product,
  context: VendingContext
): ButtonStateType => {
  const { selectedProduct, paymentMethod, status, currentBalance } = context;

  // 재고 확인
  if (product.stock <= 0) return ButtonState.OUT_OF_STOCK;

  // 선택된 상태
  if (selectedProduct === product.id) return ButtonState.SELECTED;

  // 현금 결제시 잔액 확인
  if (paymentMethod === "cash" && currentBalance < product.price) {
    return ButtonState.INSUFFICIENT_FUNDS;
  }

  // 음료 선택 가능한 상태인지 확인
  if (status === "product_select" || status === "card_process") {
    return ButtonState.AVAILABLE;
  }

  return ButtonState.DISABLED;
};

/**
 * 버튼이 비활성화되어야 하는지 확인하는 순수 함수
 * @param productState 버튼 상태
 * @returns 비활성화 여부
 */
export const isButtonDisabled = (productState: ButtonStateType): boolean => {
  return (
    productState === ButtonState.OUT_OF_STOCK ||
    productState === ButtonState.INSUFFICIENT_FUNDS ||
    productState === ButtonState.DISABLED
  );
};

/**
 * 상품 선택이 가능한지 확인하는 순수 함수
 * @param productState 버튼 상태
 * @returns 선택 가능 여부
 */
export const canSelectProduct = (productState: ButtonStateType): boolean => {
  return !isButtonDisabled(productState);
};

/**
 * 상품의 버튼 상태를 가져오는 커스텀 훅
 * @param product 상품 정보
 * @returns 버튼 상태
 */
export const useProductState = (product: Product): ButtonStateType => {
  const {
    selectedProduct,
    paymentMethod,
    status,
    currentBalance,
  } = useVendingStore();

  return getProductState(product, {
    selectedProduct,
    paymentMethod,
    status,
    currentBalance,
  });
};

/**
 * 버튼이 비활성화되어야 하는지 확인하는 커스텀 훅
 * @param product 상품 정보
 * @returns 비활성화 여부
 */
export const useButtonDisabled = (product: Product): boolean => {
  const productState = useProductState(product);
  return isButtonDisabled(productState);
};

/**
 * 상품 선택이 가능한지 확인하는 커스텀 훅
 * @param product 상품 정보
 * @returns 선택 가능 여부
 */
export const useCanSelectProduct = (product: Product): boolean => {
  const productState = useProductState(product);
  return canSelectProduct(productState);
};