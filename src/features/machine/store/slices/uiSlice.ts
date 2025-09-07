import type { StateCreator } from "zustand";
import type { VendingStatus, ErrorType, VendingStore } from "../../types/vending.types";
import { getErrorMessage } from "../../constants/errorMessages";
import { toast } from "sonner";

// UI 관련 상태 인터페이스
export interface UiSlice {
  // UI 상태
  status: VendingStatus;
  currentError: ErrorType | null;
  errorMessage: string;
  isLoading: boolean;

  // 기본 액션들 (단순한 상태 변경만)
  setStatus: (status: VendingStatus) => void;
  setError: (errorType: ErrorType, message?: string) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  resetUi: () => void;
}

// UI 슬라이스 생성 함수
export const createUiSlice: StateCreator<
  VendingStore,
  [],
  [],
  UiSlice
> = (set, _get, _api) => ({
  // 초기 상태
  status: "idle",
  currentError: null,
  errorMessage: "",
  isLoading: false,

  // 기본 액션들
  setStatus: (status) =>
    set({ status }),

  setError: (errorType, message) => {
    const errorMessage = message || getErrorMessage(errorType);
    set({
      currentError: errorType,
      errorMessage: errorMessage,
    });
    
    toast.error(errorMessage);
  },

  clearError: () =>
    set({ currentError: null, errorMessage: "" }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  resetUi: () =>
    set({
      status: "idle",
      currentError: null,
      errorMessage: "",
      isLoading: false,
    }),
});