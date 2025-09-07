import type { ProductType, VendingContext } from "../types/product.types";
import { toast } from "sonner";
import { useVendingStore } from "@/features/machine/store/vendingStore";
import { getProductState, canSelectProduct } from "../utils/productHelpers";
import { getErrorMessage } from "@/features/machine/constants/errorMessages";

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
    
    const vendingContext: VendingContext = {
      selectedProduct,
      paymentMethod,
      status,
      currentBalance,
    };

    const productState = getProductState(product, vendingContext);

    if (!canSelectProduct(productState)) {
      return;
    }

    const result = selectProduct(productId);
    
    if (result.success) {
      if (result.data?.message) {
        toast.success(result.data.message);
        
        // 잔액이 남은 경우 추가 메시지
        if (result.data.balanceMessage) {
          toast.info(result.data.balanceMessage);
        }
      }
    } else {
      if (result.errorType) {
        toast.error(getErrorMessage(result.errorType));
      } else {
        toast.error(result.error || "선택 실패");
      }
    }
  };

  return {
    handleProductSelect,
  };
}