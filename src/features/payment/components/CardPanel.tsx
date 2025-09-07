import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { CreditCard, ShoppingCart, X, Loader2 } from "lucide-react";
import { formatCurrency } from "@/shared/utils/formatters";
import { useCardPayment } from "@/features/payment/hooks/useCardPayment";
import { useVendingStore } from "@/features/machine/store/vendingStore";

export function CardPanel() {
  const {
    status,
    selectedProductForCard,
    showPaymentConfirm,
    products,
    confirmCardPayment,
    cancelCardPayment,
  } = useVendingStore();
  const { isProcessing } = useCardPayment();

  // 결제 확인
  const handlePaymentConfirm = async () => {
    await confirmCardPayment();
    // 오류 처리는 useVendingStore에서 처리
  };

  // 결제 취소
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
        {status === "cardProcess" && !showPaymentConfirm && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">카드 인식 완료</p>
            <p className="text-sm text-center py-4 text-muted-foreground border rounded-lg bg-muted/30">
              ← 좌측에서 원하는 음료를 선택해주세요
            </p>
          </div>
        )}

        {showPaymentConfirm && selectedProductForCard && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50 relative">
            {/* 결제 진행 중 오버레이 */}
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">카드 결제 처리 중...</p>
                </div>
              </div>
            )}
            
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
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    결제 중...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    결제 진행
                  </>
                )}
              </Button>
              <Button
                onClick={handlePaymentCancel}
                variant="outline"
                disabled={isProcessing}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
            </div>
          </div>
        )}

        {isProcessing && !showPaymentConfirm && (
          <div className="flex items-center justify-center py-4">
            <span>처리 중...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
