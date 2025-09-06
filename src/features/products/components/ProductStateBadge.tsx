import { Badge } from "@/shared/components/ui/badge";
import type { ButtonStateType } from "../types/product.types";
import { ButtonState } from "../types/product.types";

interface ProductStateBadgeProps {
  state: ButtonStateType;
}

/**
 * 상품별 상태 배지 컴포넌트
 * - 상품의 현재 상태에 따라 적절한 배지를 표시
 * - 품절, 금액부족, 선택됨 등의 상태를 시각적으로 표현
 */
export function ProductStateBadge({ state }: ProductStateBadgeProps) {
  switch (state) {
    case ButtonState.OUT_OF_STOCK:
      return (
        <Badge variant="destructive" className="text-xs">
          품절
        </Badge>
      );
    case ButtonState.INSUFFICIENT_FUNDS:
      return (
        <Badge variant="secondary" className="text-xs">
          금액부족
        </Badge>
      );
    case ButtonState.SELECTED:
      return (
        <Badge className="text-xs">
          선택됨
        </Badge>
      );
    default:
      return null;
  }
}