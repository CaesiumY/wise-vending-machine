import { Button } from "@/shared/components/ui/button";
import type { Product } from "../types/product.types";
import { ButtonState } from "../types/product.types";
import { useProductState, isButtonDisabled } from "../utils/productHelpers";
import { ProductStateBadge } from "./ProductStateBadge";
import { formatCurrency } from "@/shared/utils/formatters";

interface ProductButtonProps {
  product: Product;
  onSelect: () => void;
}

/**
 * 개별 상품 버튼 컴포넌트
 * - 상품 정보와 상태를 표시하는 통합 버튼
 * - 커스텀 훅을 사용하여 자판기 상태를 직접 계산
 * - 간단한 API로 상품 정보만 받아서 동작
 */
export function ProductButton({ product, onSelect }: ProductButtonProps) {
  // 커스텀 훅으로 상태 계산
  const state = useProductState(product);
  const disabled = isButtonDisabled(state);

  return (
    <Button
      className="h-28 w-full flex flex-col items-center justify-center gap-2"
      disabled={disabled}
      onClick={onSelect}
      aria-label={`${product.name} ${formatCurrency(product.price)}, 재고 ${product.stock}개`}
      aria-disabled={disabled}
      aria-pressed={state === ButtonState.SELECTED}
    >
      {/* 상품 정보 */}
      <span className="font-bold text-lg">
        {product.name} ({product.stock})
      </span>

      {/* 가격 정보 */}
      <span className="text-sm">
        {formatCurrency(product.price)}
      </span>

      {/* 상태 표시 */}
      <div className="flex gap-1 flex-wrap justify-center">
        <ProductStateBadge state={state} />
      </div>
    </Button>
  );
}
