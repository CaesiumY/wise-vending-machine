import type { StateCreator } from 'zustand';
import type { Transaction, VendingStore } from '../../types/vending.types';

// 거래 상태 인터페이스 (상태만)
interface TransactionState {
  lastTransaction: Transaction | null;
}

// 초기 상태 (재사용 가능)
const initialTransactionState: TransactionState = {
  lastTransaction: null,
};

// 거래 액션 인터페이스 (액션만)
interface TransactionActions {
  resetTransaction: () => void;
}

// 거래 슬라이스 타입 (상태 + 액션)
export interface TransactionSlice
  extends TransactionState,
    TransactionActions {}

// 거래 슬라이스 생성 함수
export const createTransactionSlice: StateCreator<
  VendingStore,
  [],
  [],
  TransactionSlice
> = (set, _get, _api) => ({
  // 초기 상태 spread
  ...initialTransactionState,

  // 액션들
  resetTransaction: () => set(initialTransactionState),
});
