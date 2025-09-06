interface ProductInfoProps {
  name: string;
  stock: number;
}

/**
 * 상품 정보 컴포넌트
 * - 상품명과 재고 수량을 표시
 * - 재고 정보와 함께 한 줄로 깔끔하게 표현
 */
export function ProductInfo({ name, stock }: ProductInfoProps) {
  return (
    <span className="font-bold text-lg">
      {name} ({stock})
    </span>
  );
}