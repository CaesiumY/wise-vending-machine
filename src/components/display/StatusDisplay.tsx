import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useVendingStore } from "@/stores/vendingStore";
import type { VendingStatus } from "@/types";

interface StatusDisplayProps {
  className?: string;
}

export function StatusDisplay({ className }: StatusDisplayProps) {
  const {
    currentBalance,
    selectedProduct,
    paymentMethod,
    status,
    products,
    errorMessage,
    currentError,
  } = useVendingStore();

  // 선택된 제품 정보
  const selectedProductInfo = selectedProduct
    ? products[selectedProduct]
    : null;

  // 상태별 색상 반환 (중립 톤, 상태 강조만 배지로)
  const getStatusColor = (_status: VendingStatus) => "";

  // 상태별 메시지 반환
  const getStatusMessage = () => {
    if (currentError && errorMessage) {
      return errorMessage;
    }

    switch (status) {
      case "idle":
        return "음료를 선택해주세요";
      case "cash_input":
        return "현금을 투입해주세요";
      case "product_select":
        return "구매할 음료를 선택해주세요";
      case "card_process":
        return "카드를 삽입해주세요";
      case "dispensing":
        return "음료를 배출하고 있습니다...";
      case "completing":
        return "거래를 완료하고 있습니다...";
      case "maintenance":
        return "시스템 점검 중입니다";
      default:
        return "준비 중입니다...";
    }
  };

  return (
    <Card className={cn("p-4 mb-4", className)}>
      <div className="space-y-3">
        {/* 상태 메시지 */}
        <div className="text-center">
          <p className={cn("text-lg font-semibold", getStatusColor(status))}>
            {getStatusMessage()}
          </p>
        </div>

        {/* 투입 금액 표시 */}
        <div className="flex justify-between items-center rounded-md p-3 border border-border bg-background">
          <span>투입금액</span>
          <span className="text-2xl font-bold">
            {currentBalance.toLocaleString()}원
          </span>
        </div>

        {/* 선택된 음료 정보 */}
        {selectedProductInfo && (
          <div className="flex justify-between items-center rounded-md p-3 border border-border bg-background">
            <span>선택한 음료</span>
            <div className="text-right">
              <div className="text-lg font-semibold">
                {selectedProductInfo.name}
              </div>
              <div>{selectedProductInfo.price.toLocaleString()}원</div>
            </div>
          </div>
        )}

        {/* 잔액 확인 (현금 결제시) */}
        {paymentMethod === "cash" &&
          selectedProductInfo &&
          currentBalance >= selectedProductInfo.price && (
            <div className="flex justify-between items-center rounded-md p-3 border border-border bg-background">
              <span>거스름돈</span>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {(
                    currentBalance - selectedProductInfo.price
                  ).toLocaleString()}
                  원
                </div>
              </div>
            </div>
          )}


        {/* 에러 상태 표시 */}
        {currentError && (
          <div className="rounded-md p-3 border border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-2">
              <span className="text-sm">오류 발생</span>
            </div>
          </div>
        )}

        {/* 진행 상태 표시 (배출 중일 때) */}
        {(status === "dispensing" || status === "completing") && (
          <div className="rounded-md p-3 border border-border bg-background">
            <div className="flex items-center gap-3">
              <span className="text-sm">
                {status === "dispensing"
                  ? "음료 배출 중..."
                  : "거래 완료 중..."}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
