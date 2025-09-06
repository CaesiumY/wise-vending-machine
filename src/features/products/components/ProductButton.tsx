import { Button } from "@/shared/components/ui/button";
import type { Product } from "../types/product.types";
import { ButtonState } from "../types/product.types";
import { useProductState, useButtonDisabled } from "../utils/productHelpers";
import { ProductStateBadge } from "./ProductStateBadge";
import { ProductInfo } from "./ProductInfo";
import { ProductPrice } from "./ProductPrice";

interface ProductButtonProps {
  product: Product;
  onSelect: () => void;
}

/**
 * 개별 상품 버튼 컴포넌트
 * - 작은 컴포넌트들을 조합하여 완성된 버튼을 구성
 * - 커스텀 훅을 사용하여 자판기 상태를 직접 계산
 * - 간단한 API로 상품 정보만 받아서 동작
 */
export function ProductButton({
  product,
  onSelect,
}: ProductButtonProps) {
  // 커스텀 훅으로 상태 계산
  const state = useProductState(product);
  const disabled = useButtonDisabled(product);

  return (
    <div className="relative">
      <Button
        className="w-full flex flex-col items-center justify-center gap-2"
        disabled={disabled}
        onClick={onSelect}
        aria-label={`${product.name} ${product.price}원, 재고 ${product.stock}개`}
        aria-disabled={disabled}
        aria-pressed={state === ButtonState.SELECTED}
      >
        {/* 상품 아이콘 영역 */}
        <div className="text-3xl" />

        {/* 상품 정보 */}
        <ProductInfo name={product.name} stock={product.stock} />

        {/* 가격 정보 */}
        <ProductPrice price={product.price} />

        {/* 상태 표시 */}
        <div className="flex gap-1 flex-wrap justify-center">
          <ProductStateBadge state={state} />
        </div>
      </Button>
    </div>
  );
}
