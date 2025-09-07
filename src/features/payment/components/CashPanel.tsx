import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/ui";
import { formatCurrency, formatDenomination } from "@/shared/utils/formatters";
import { useVendingStore } from "@/features/machine/store/vendingStore";
import { CASH_DENOMINATIONS } from "@/features/payment/constants/denominations";
import type { CashDenomination } from "@/features/payment/types/payment.types";
import { isProcessing, canInsertCash, isIdleState } from "@/shared/utils/statusHelpers";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/machine/constants/errorMessages";

interface CashPanelProps {
  className?: string;
}

export function CashPanel({ className }: CashPanelProps) {
  const {
    currentBalance,
    status,
    paymentMethod,
    insertCash,
    cancelTransaction,
  } = useVendingStore();

  const isVisible = paymentMethod === "cash";
  const isDisabled = isProcessing(status);
  const canInsertCashNow = !isDisabled && canInsertCash(status);

  // 현금 투입 핸들러
  const handleCashInsert = (amount: CashDenomination) => {
    if (!canInsertCashNow) return;

    const result = insertCash(amount);
    
    if (!result.success) {
      const errorMessage = result.errorType 
        ? getErrorMessage(result.errorType)
        : result.error || "현금 투입에 실패했습니다.";
      toast.error(errorMessage);
      return;
    }
    
    if (result.data?.message) {
      toast.success(result.data.message);
    }
  };

  // 반환 버튼 핸들러
  const handleReturn = () => {
    if (currentBalance <= 0) return;
    
    const result = cancelTransaction();
    
    if (!result.success) {
      return;
    }
    
    if (result.data?.message) {
      toast.success(result.data.message);
    }
  };

  // 컴포넌트가 보이지 않는 경우
  if (!isVisible) return null;

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="text-center">
          <h3 className="text-lg font-semibold">현금 투입</h3>
        </div>

        {/* 현금 투입 버튼들 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CASH_DENOMINATIONS.map((denomination) => (
            <Button
              key={denomination}
              className={cn(
                "h-16 flex flex-col items-center justify-center gap-1",
                "font-bold"
              )}
              onClick={() => handleCashInsert(denomination)}
              disabled={!canInsertCashNow}
            >
              <span className="text-lg">{formatCurrency(denomination)}</span>
              <span className="text-xs">{formatDenomination(denomination)}</span>
            </Button>
          ))}

          {/* 반환 버튼 */}
          <Button
            variant="outline"
            className={cn(
              "h-16 flex flex-col items-center justify-center gap-1"
            )}
            onClick={handleReturn}
            disabled={isDisabled || currentBalance === 0}
          >
            <span className="text-xs">반환</span>
          </Button>
        </div>

        {/* 상태 메시지 */}
        {(() => {
          const shouldShowStatusMessage = 
            !canInsertCashNow && currentBalance === 0;
          
          return shouldShowStatusMessage && (
            <div className="text-center">
              <Badge variant="secondary" className="text-sm">
                {isIdleState(status) ? "결제 방식을 선택해주세요" : "처리 중..."}
              </Badge>
            </div>
          );
        })()}
      </div>
    </Card>
  );
}
