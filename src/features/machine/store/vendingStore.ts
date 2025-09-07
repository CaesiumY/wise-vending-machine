import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { VendingStore } from "../types/vending.types";

// 슬라이스 임포트
import { createPaymentSlice } from "./slices/paymentSlice";
import { createProductSlice } from "./slices/productSlice";
import { createTransactionSlice } from "./slices/transactionSlice";
import { createUiSlice } from "./slices/uiSlice";

// 액션 임포트
import { createCashActions } from "./actions/cashActions";
import { createCardActions } from "./actions/cardActions";
import { createDispenseActions } from "./actions/dispenseActions";
import { createIntegrationActions } from "./actions/integrationActions";
import { createResetActions } from "./actions/resetActions";

// 슬라이스와 액션을 조합한 통합 스토어 생성
export const useVendingStore = create<VendingStore>()(
  devtools((set, get, api) => ({
    // 슬라이스 조합
    ...createPaymentSlice(set, get, api),
    ...createProductSlice(set, get, api),
    ...createTransactionSlice(set, get, api),
    ...createUiSlice(set, get, api),

    // 액션 조합
    ...createCashActions(set, get, api),
    ...createCardActions(set, get, api),
    ...createDispenseActions(set, get, api),
    ...createIntegrationActions(set, get, api),
    ...createResetActions(set, get, api),
  }),
  { name: "useVendingStore" } // Redux DevTools에서 표시될 이름
)
);
