import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils/ui";
import { formatCurrency } from "@/shared/utils/formatters";
import { useVendingStore } from "../store/vendingStore";

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
  } = useVendingStore();

  // 선택된 제품 정보
  const selectedProductInfo = selectedProduct
    ? products[selectedProduct]
    : null;


  const getStatusMessage = () => {
    switch (status) {
      case "idle":
        return "음료를 선택해주세요";
      case "cashInput":
        return "현금을 투입해주세요";
      case "productSelect":
        return "구매할 음료를 선택해주세요";
      case "cardProcess":
        return "카드를 삽입해주세요";
      case "dispensing":
        return "음료를 배출하고 있습니다...";
      case "completing":
        return "음료를 선택해주세요";
      default:
        return "준비 중입니다...";
    }
  };

  return (
    <Card className={cn("p-4 mb-4", className)}>
      <div className="space-y-3">
        {/* 상태 메시지 */}
        <div className="text-center">
          <p className="text-lg font-semibold">
            {getStatusMessage()}
          </p>
        </div>

        {/* 투입 금액 표시 */}
        <div className="flex justify-between items-center rounded-md p-3 border border-border bg-background">
          <span>투입금액</span>
          <span className="text-2xl font-bold">
            {formatCurrency(currentBalance)}
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
              <div>{formatCurrency(selectedProductInfo.price)}</div>
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
                  {formatCurrency(currentBalance - selectedProductInfo.price)}
                </div>
              </div>
            </div>
          )}
      </div>
    </Card>
  );
}
