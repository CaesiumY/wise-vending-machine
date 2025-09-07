import type { StateCreator } from "zustand";
import type { ProductType, Product } from "@/features/products/types/product.types";
import type { VendingStore } from "../../types/vending.types";
import { PRODUCTS } from "@/features/products/constants/products";

// 상품 관련 상태 인터페이스
export interface ProductSlice {
  // 상품 관련 상태
  products: Record<ProductType, Product>;
  selectedProduct: ProductType | null;

  // 기본 액션들 (단순한 상태 변경만) - 사용되는 함수만 유지
  setSelectedProduct: (productId: ProductType | null) => void;
  updateProductStock: (productId: ProductType, newStock: number) => void;
}

// 상품 슬라이스 생성 함수
export const createProductSlice: StateCreator<
  VendingStore,
  [],
  [],
  ProductSlice
> = (set, _get, _api) => ({
  // 초기 상태
  products: PRODUCTS,
  selectedProduct: null,

  // 기본 액션들 - 사용되는 함수만 유지
  setSelectedProduct: (productId) =>
    set({ selectedProduct: productId }),

  updateProductStock: (productId, newStock) =>
    set((state) => ({
      products: {
        ...state.products,
        [productId]: {
          ...state.products[productId],
          stock: Math.max(0, newStock),
        },
      },
    })),
});