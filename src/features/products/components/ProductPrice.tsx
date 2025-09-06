interface ProductPriceProps {
  price: number;
}

/**
 * 상품 가격 컴포넌트
 * - 가격을 천 단위 구분자와 함께 표시
 * - 일관된 스타일로 가격 정보 제공
 */
export function ProductPrice({ price }: ProductPriceProps) {
  return (
    <span className="text-sm">
      {price.toLocaleString()}원
    </span>
  );
}