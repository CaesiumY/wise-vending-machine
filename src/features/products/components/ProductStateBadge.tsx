import { Badge } from '@/shared/components/ui/badge';
import { ButtonState, type ButtonStateType } from '../types/product.types';

interface ProductStateBadgeProps {
  state: ButtonStateType;
}

// 상태별 배지 구성 맵
const STATE_BADGE_CONFIG = {
  [ButtonState.OUT_OF_STOCK]: {
    variant: 'destructive' as const,
    text: '품절',
  },
  [ButtonState.INSUFFICIENT_FUNDS]: {
    variant: 'secondary' as const,
    text: '금액부족',
  },
  [ButtonState.SELECTED]: {
    variant: 'default' as const,
    text: '선택됨',
  },
  [ButtonState.AVAILABLE]: null, // 배지 표시하지 않음
  [ButtonState.DISABLED]: null, // 배지 표시하지 않음
} as const;

/**
 * 상품별 상태 배지 컴포넌트
 * - 상품의 현재 상태에 따라 적절한 배지를 표시
 * - 품절, 금액부족, 선택됨 등의 상태를 시각적으로 표현
 */
export function ProductStateBadge({ state }: ProductStateBadgeProps) {
  const config = STATE_BADGE_CONFIG[state];

  if (!config) return null;

  return (
    <Badge variant={config.variant} className="text-xs">
      {config.text}
    </Badge>
  );
}
