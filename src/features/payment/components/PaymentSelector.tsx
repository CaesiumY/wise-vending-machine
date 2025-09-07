import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils/ui";
import { useVendingStore } from "@/features/machine/store/vendingStore";
import { useCardPayment } from "@/features/payment/hooks/useCardPayment";
import type { PaymentMethod } from "@/features/payment/types/payment.types";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/machine/constants/errorMessages";

interface PaymentSelectorProps {
  className?: string;
}

export function PaymentSelector({ className }: PaymentSelectorProps) {
  const { paymentMethod, status, setPaymentMethod, resetPaymentMethod } = useVendingStore();
  const { autoRecognizeCard } = useCardPayment();

  const isSelectionDisabled = status !== "idle";
  
  const shouldShowCancelButton = paymentMethod !== null && status !== "idle";

  // 결제 방식 선택 핸들러
  const handlePaymentSelect = (method: PaymentMethod) => {
    if (isSelectionDisabled) return;

    const result = setPaymentMethod(method);
    if (!result.success) {
      return;
    }

    // 카드 결제 선택 시 자동으로 카드 인식
    if (method === "card") {
      autoRecognizeCard();
    }
  };

  // 결제 방식 취소 핸들러
  const handlePaymentCancel = () => {
    const result = resetPaymentMethod();
    
    if (!result.success) {
      const errorMessage = result.errorType 
        ? getErrorMessage(result.errorType)
        : result.error || "취소에 실패했습니다.";
      toast.error(errorMessage);
      return;
    }
    
    if (result.data?.message) {
      toast.success(result.data.message);
    }
  };

  return (
    <Card className={cn("p-4 mb-4", className)}>
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-center">결제 방식 선택</h3>
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
