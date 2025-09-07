import type { ProductType } from "@/features/products/types/product.types";
import type {
  PaymentMethod,
  CashDenomination,
  TransactionStatus,
} from "@/features/payment/types/payment.types";
import type { PaymentSlice } from "../store/slices/paymentSlice";
import type { ProductSlice } from "../store/slices/productSlice";
import type { TransactionSlice } from "../store/slices/transactionSlice";
import type { UiSlice } from "../store/slices/uiSlice";
import type { CashActions } from "../store/actions/cashActions";
import type { CardActions } from "../store/actions/cardActions";
import type { DispenseActions } from "../store/actions/dispenseActions";
import type { IntegrationActions } from "../store/actions/integrationActions";
import type { ResetActions } from "../store/actions/resetActions";

// 자판기 상태 타입
export type VendingStatus =
  | "idle" // 대기 상태
  | "cashInput" // 현금 투입 중
  | "cardProcess" // 카드 처리 중
  | "productSelect" // 음료 선택 중
  | "dispensing" // 배출 진행 중
  | "completing"; // 거스름돈 처리 중

// ErrorType은 별도 파일에서 정의하여 import
export type { ErrorType } from "@/features/machine/constants/errorTypes";

// ===== 핵심 타입 정의 =====

// 거스름돈 계산 결과
export interface ChangeBreakdown {
  canProvideChange: boolean;
  totalChange: number;
  breakdown: { [K in CashDenomination]: number };
}

// 거래 정보
export interface Transaction {
  id: string;
  productId: ProductType | null;
  productName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  change: number;
  changeBreakdown?: ChangeBreakdown;
  timestamp: Date;
  status: TransactionStatus;
}

// 통합 스토어 타입
export type VendingStore = PaymentSlice &
  ProductSlice &
  TransactionSlice &
  UiSlice &
  CashActions &
  CardActions &
  DispenseActions &
  IntegrationActions &
  ResetActions;
