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

export type VendingStatus =
  | "idle"
  | "cashInput"
  | "cardProcess"
  | "productSelect"
  | "dispensing"
  | "completing";

export type { ErrorType } from "@/features/machine/constants/errorTypes";

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

export type VendingStore = PaymentSlice &
  ProductSlice &
  TransactionSlice &
  UiSlice &
  CashActions &
  CardActions &
  DispenseActions &
  IntegrationActions &
  ResetActions;
