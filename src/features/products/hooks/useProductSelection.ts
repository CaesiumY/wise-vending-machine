import { useVendingStore } from "@/features/machine/store/vendingStore";
import type { ProductType, VendingContext } from "../types/product.types";
import { getProductState, canSelectProduct } from "../utils/productHelpers";

/**
 * 상품 선택과 관련된 비즈니스 로직을 담당하는 커스텀 훅
 */
export function useProductSelection() {
  const {
    products,
    selectedProduct,
    paymentMethod,
    status,
    currentBalance,
    selectProduct,
  } = useVendingStore();

  /**
   * 상품 선택 처리 함수
   * @param productId 선택할 상품 ID
   */
  const handleProductSelect = (productId: ProductType): void => {
    const product = products[productId];
    
    // 상태 검증을 위한 컨텍스트 생성
    const vendingContext: VendingContext = {
      selectedProduct,
      paymentMethod,
      status,
      currentBalance,
    };

    const productState = getProductState(product, vendingContext);

    // 선택 불가능한 상태면 무시
    if (!canSelectProduct(productState)) {
      return;
    }

    selectProduct(productId);
  };

  return {
    products,
    handleProductSelect,
  };
}