import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { CreditCard, ShoppingCart, X } from "lucide-react";
import { formatCurrency } from "@/shared/utils/formatters";
import { useVendingStore } from "@/features/machine/store/vendingStore";
import { isCardInputState } from "@/shared/utils/statusHelpers";
import { toast } from "sonner";

export function CardPanel() {
  // Zustand 전역 상태 직접 사용 (useState, useEffect 없이!)
  const {
    status,
    products,
    showPaymentConfirm,
    selectedProductForCard,
    confirmCardPayment,
    cancelCardPayment,
  } = useVendingStore();

  // 결제 확인 - Zustand 액션 직접 호출
  const handlePaymentConfirm = () => {
    if (selectedProductForCard) {
      const result = confirmCardPayment(selectedProductForCard);
      
      if (result.success) {
        // 배출 성공 시 토스트 표시
        if (result.data?.message) {
          toast.success(result.data.message);
        }
      } else {
        // 에러 타입별 메시지 처리
        const errorMessages: Record<string, string> = {
          cardReaderFault: "카드를 다시 삽입해주세요",
          cardPaymentReject: "다른 카드를 사용해주세요",
          dispenseFailure: "배출에 실패했습니다. 결제가 취소됩니다."
        };
        
        const message = result.errorType ? 
          errorMessages[result.errorType] || result.error : 
          result.error || "결제 실패";
          
        toast.error(message);
      }
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
