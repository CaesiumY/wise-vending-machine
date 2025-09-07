import type { StateCreator } from "zustand";
import type { VendingStatus, ErrorType, VendingStore } from "../../types/vending.types";
import { getErrorMessage } from "../../constants/errorMessages";

// UI 상태 인터페이스 (상태만)
interface UiState {
  status: VendingStatus;
  currentError: ErrorType | null;
  errorMessage: string;
}

// 초기 상태 (재사용 가능)
const initialUiState: UiState = {
  status: "idle",
  currentError: null,
  errorMessage: "",
};

// UI 액션 인터페이스 (액션만)
interface UiActions {
  setStatus: (status: VendingStatus) => void;
  setError: (errorType: ErrorType, message?: string) => void;
  clearError: () => void;
  resetUi: () => void;
}

// UI 슬라이스 타입 (상태 + 액션)
export interface UiSlice extends UiState, UiActions {}

// UI 슬라이스 생성 함수
export const createUiSlice: StateCreator<
  VendingStore,
  [],
  [],
  UiSlice
> = (set, _get, _api) => ({
  ...initialUiState,
  setStatus: (status) =>
    set({ status }),

  setError: (errorType, message) => {
    const errorMessage = message || getErrorMessage(errorType);
    set({
      currentError: errorType,
      errorMessage,
    });
  },

  clearError: () =>
    set({ currentError: null, errorMessage: "" }),

  resetUi: () => set(initialUiState),
});