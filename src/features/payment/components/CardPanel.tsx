import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { CreditCard, ShoppingCart, X, Clock } from "lucide-react";
import { formatCurrency } from "@/shared/utils/formatters";
import { useVendingStore } from "@/features/machine/store/vendingStore";
import { isCardInputState } from "@/features/payment/utils/statusHelpers";
import { usePaymentTimeout } from "@/features/payment/hooks/usePaymentTimeout";
import { toast } from "sonner";
import { getErrorMessage } from "@/features/machine/constants/errorMessages";

export function CardPanel() {
  const {
    status,
    products,
    showPaymentConfirm,
    selectedProductForCard,
    confirmCardPayment,
    cancelCardPayment,
  } = useVendingStore();

  const { remainingTime, hasActiveTimeout } = usePaymentTimeout();

  // 결제 확인 - Zustand 액션 직접 호출
  const handlePaymentConfirm = () => {
    if (!selectedProductForCard) return;
    
    const result = confirmCardPayment(selectedProductForCard);
    
    if (!result.success) {
      const errorMessage = result.errorType 
        ? getErrorMessage(result.errorType)
        : result.error || "카드 결제에 실패했습니다.";
      toast.error(errorMessage);
      return;
    }
    
    if (result.data?.message) {
      toast.success(result.data.message);
    }
  };

  // 결제 취소 - Zustand 액션 직접 호출
  const handlePaymentCancel = () => {
    cancelCardPayment();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          카드 결제
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 타임아웃 표시 */}
        {hasActiveTimeout && (
          <div className="flex items-center gap-2 p-3 rounded-lg border text-sm bg-muted/50 border-muted text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              남은 시간: <strong>{remainingTime}초</strong>
            </span>
          </div>
        )}
        
        {isCardInputState(status) && !showPaymentConfirm && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">카드 인식 완료</p>
            <p className="text-sm text-center py-4 text-muted-foreground border rounded-lg bg-muted/30">
              ← 좌측에서 원하는 음료를 선택해주세요
            </p>
          </div>
        )}

        {showPaymentConfirm && selectedProductForCard && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShoppingCart className="h-4 w-4" />
              결제 확인
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>선택 음료:</span>
                <span className="font-medium">
                  {products[selectedProductForCard].name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>가격:</span>
                <span className="font-medium">
                  {formatCurrency(products[selectedProductForCard].price)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePaymentConfirm}
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                결제 진행
              </Button>
              <Button
                onClick={handlePaymentCancel}
                variant="outline"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
