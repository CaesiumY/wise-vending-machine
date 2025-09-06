import { cn } from "@/shared/utils/ui";
import { useProductSelection } from "../hooks/useProductSelection";
import { ProductButton } from "./ProductButton";

interface ProductDisplayProps {
  className?: string;
}

/**
 * 상품 디스플레이 컴포넌트
 * - 순수 프레젠테이션 컴포넌트로 UI 렌더링만 담당
 * - 모든 비즈니스 로직은 useProductSelection 훅으로 위임
 */
export function ProductDisplay({ className }: ProductDisplayProps) {
  const { 
    products, 
    handleProductSelect, 
  } = useProductSelection();

  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {Object.values(products).map((product) => (
        <ProductButton
          key={product.id}
          product={product}
          onSelect={() => handleProductSelect(product.id)}
        />
      ))}
    </div>
  );
}
