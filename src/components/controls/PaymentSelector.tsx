import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useVendingStore } from "@/stores/vendingStore";
import type { PaymentMethod } from "@/types";
import { X } from "lucide-react";

interface PaymentSelectorProps {
  className?: string;
}

export function PaymentSelector({ className }: PaymentSelectorProps) {
  const { paymentMethod, status, setPaymentMethod, resetPaymentMethod } = useVendingStore();

  // 결제 방식 선택 가능한 상태인지 확인
  const isSelectionDisabled = status !== "idle";
  
  // 취소 버튼 표시 조건: 결제 방식이 선택되었고 대기 상태가 아닐 때
  const shouldShowCancelButton = paymentMethod !== null && status !== "idle";

  // 결제 방식 선택 핸들러
  const handlePaymentSelect = (method: PaymentMethod) => {
    if (isSelectionDisabled) return;

    const result = setPaymentMethod(method);
    if (!result.success) {
      console.warn("결제 방식 설정 실패:", result.error);
    }
  };

  // 결제 방식 취소 핸들러
  const handlePaymentCancel = () => {
    const result = resetPaymentMethod();
    if (!result.success) {
      console.warn("결제 방식 취소 실패:", result.error);
    }
  };

  return (
    <Card className={cn("p-4 mb-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-center flex-1">결제 방식 선택</h3>
        {shouldShowCancelButton && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={handlePaymentCancel}
            aria-label="결제 방식 취소"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* 현금 결제 버튼 */}
        <Button
          variant={paymentMethod === "cash" ? "default" : "outline"}
          className={cn(
            "h-16 flex flex-col items-center gap-1 relative transition",
            paymentMethod === "cash" && "ring-2 ring-offset-2 ring-primary"
          )}
          onClick={() => handlePaymentSelect("cash")}
          disabled={isSelectionDisabled}
          aria-pressed={paymentMethod === "cash"}
        >
          <div className="text-center">
            <div className="font-semibold">현금 결제</div>
            <div className="text-xs opacity-75">지폐/동전 투입</div>
          </div>
        </Button>

        {/* 카드 결제 버튼 */}
        <Button
          variant={paymentMethod === "card" ? "default" : "outline"}
          className={cn(
            "h-16 flex flex-col items-center gap-1 relative transition",
            paymentMethod === "card" && "ring-2 ring-offset-2 ring-primary"
          )}
          onClick={() => handlePaymentSelect("card")}
          disabled={isSelectionDisabled}
          aria-pressed={paymentMethod === "card"}
        >
          <div className="text-center">
            <div className="font-semibold">카드 결제</div>
            <div className="text-xs opacity-75">신용/체크카드</div>
          </div>
        </Button>
      </div>
      
      {shouldShowCancelButton && (
        <div className="mt-3 text-center">
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={handlePaymentCancel}
          >
            다른 결제 방식 선택
          </Button>
        </div>
      )}
    </Card>
  );
}
