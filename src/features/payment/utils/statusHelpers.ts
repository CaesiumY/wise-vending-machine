import type { VendingStatus } from '@/features/machine/types/vending.types';

// 상태별 상수 정의
const CASH_INSERT_STATES: readonly VendingStatus[] = [
  'cashInput',
  'productSelect',
] as const;

/**
 * 현금 투입이 가능한 상태인지 확인합니다.
 */
export const canInsertCash = (status: VendingStatus): boolean =>
  CASH_INSERT_STATES.includes(status);

/**
 * 카드 입력 상태인지 확인합니다.
 */
export const isCardInputState = (status: VendingStatus): boolean =>
  status === 'cardProcess';

/**
 * 대기 상태인지 확인합니다.
 */
export const isIdleState = (status: VendingStatus): boolean =>
  status === 'idle';
