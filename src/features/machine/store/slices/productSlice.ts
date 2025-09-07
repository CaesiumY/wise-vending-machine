import type { StateCreator } from "zustand";
import type { ProductType, Product } from "@/features/products/types/product.types";
import type { VendingStore } from "../../types/vending.types";
import { PRODUCTS } from "@/features/products/constants/products";
import { ensureNonNegative } from "@/shared/utils/paymentHelpers";

// 상품 상태 인터페이스 (상태만)
interface ProductState {
  products: Record<ProductType, Product>;
  selectedProduct: ProductType | null;
}

// 초기 상태 (재사용 가능)
const initialProductState: ProductState = {
  products: PRODUCTS,
  selectedProduct: null,
};

// 상품 액션 인터페이스 (액션만)
interface ProductActions {
  updateProductStock: (productId: ProductType, newStock: number) => void;
  resetProducts: () => void;
}

// 상품 슬라이스 타입 (상태 + 액션)
export interface ProductSlice extends ProductState, ProductActions {}

// 상품 슬라이스 생성 함수
export const createProductSlice: StateCreator<
  VendingStore,
  [],
  [],
  ProductSlice
> = (set, _get, _api) => ({
  // 초기 상태 spread
  ...initialProductState,

  // 액션들
  updateProductStock: (productId, newStock) =>
    set((state) => ({
      products: {
        ...state.products,
        [productId]: {
          ...state.products[productId],
          stock: ensureNonNegative(newStock),
        },
      },
    })),

  resetProducts: () => set(initialProductState),
});