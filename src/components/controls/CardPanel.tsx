import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { useCardPayment } from "@/hooks/useCardPayment";
import { useVendingStore } from "@/stores/vendingStore";
import type { ProductType, Product } from "@/types";

interface AvailableProduct extends Product {
  isAvailable: boolean;
  reason: string | null;
}

export function CardPanel() {
  const { status } = useVendingStore();
  const {
    recognizeCard,
    processCardPayment,
    dispenseWithCard,
    checkStockAndActivateButtons,
    isProcessing,
    cardInfo,
  } = useCardPayment();

  const [availableProducts, setAvailableProducts] = useState<
    AvailableProduct[]
  >([]);

  useEffect(() => {
    setAvailableProducts(checkStockAndActivateButtons());
  }, [checkStockAndActivateButtons]);

  const handleCardInsert = async () => {
    const recognized = await recognizeCard();
    if (recognized) {
      setAvailableProducts(checkStockAndActivateButtons());
    }
  };

  const handleProductSelect = async (productId: ProductType) => {
    useVendingStore.getState().selectProduct(productId);

    const paymentSuccess = await processCardPayment(productId);
    if (paymentSuccess) {
      await dispenseWithCard(productId);
    }
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
        {status === "idle" && (
          <Button
            onClick={handleCardInsert}
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? <></> : <CreditCard className="h-4 w-4 mr-2" />}
            카드 삽입
          </Button>
        )}

        {cardInfo && status === "card_process" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              카드 인식: {cardInfo.cardNumber}
            </p>

            <div className="grid gap-2">
              {availableProducts.map((product) => (
                <Button
                  key={product.id}
                  onClick={() => handleProductSelect(product.id)}
                  disabled={!product.isAvailable || isProcessing}
                  variant={product.isAvailable ? "default" : "secondary"}
                  className="w-full justify-between"
                >
                  <span>{product.name}</span>
                  <span>{product.price}원</span>
                  {!product.isAvailable && (
                    <span className="text-xs">({product.reason})</span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center py-4">
            <span>처리 중...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
