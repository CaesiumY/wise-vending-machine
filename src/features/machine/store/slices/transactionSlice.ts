import type { StateCreator } from "zustand";
import type { Transaction, VendingStore } from "../../types/vending.types";

// 거래 관련 상태 인터페이스
export interface TransactionSlice {
  // 거래 관련 상태 (lastTransaction은 액션에서 직접 set 사용)
  lastTransaction: Transaction | null;
}

// 거래 슬라이스 생성 함수
export const createTransactionSlice: StateCreator<
  VendingStore,
  [],
  [],
  TransactionSlice
> = (_set, _get, _api) => ({
  // 초기 상태
  lastTransaction: null,
});