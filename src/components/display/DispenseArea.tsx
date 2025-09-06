import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useVendingStore } from "@/stores/vendingStore";
import { PRODUCT_IMAGES } from "@/constants/products";

interface DispenseAreaProps {
  className?: string;
}

export function DispenseArea({ className }: DispenseAreaProps) {
  const { status, lastTransaction, paymentMethod } = useVendingStore();

  // 배출 상태 확인
  const isDispensing = status === "dispensing";
  const isCompleting = status === "completing";

  // 최근 배출된 음료
  const lastDispensedProduct = lastTransaction?.productId;

  // 거스름돈 표시 (현금 결제시만)
  const changeAmount =
    paymentMethod === "cash" && lastTransaction?.change
      ? lastTransaction.change
      : 0;
  const shouldShowChange =
    changeAmount > 0 && (status === "completing" || status === "idle");

  return (
    <div
      className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto", className)}
    >
      {/* 음료 배출구 */}
      <Card className="p-4">
        <div className="text-center">
          <div className="text-sm mb-2">음료 배출구</div>
          <div
            className={cn(
              "h-20 rounded-md border",
              "flex items-center justify-center",
              isDispensing && "",
              isCompleting && ""
            )}
          >
            {isDispensing && (
              <div className="flex items-center gap-2">
                <span className="text-sm">배출중...</span>
              </div>
            )}

            {isCompleting && (
              <div className="flex items-center gap-2">
                <span className="text-sm">완료중...</span>
              </div>
            )}

            {lastDispensedProduct && !isDispensing && !isCompleting && (
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {PRODUCT_IMAGES[lastDispensedProduct]}
                </div>
                <div className="text-xs">배출 완료</div>
              </div>
            )}

            {!isDispensing && !isCompleting && !lastDispensedProduct && (
              <div className="text-sm">배출구</div>
            )}
          </div>
        </div>
      </Card>

      {/* 거스름돈 반환구 */}
      <Card className="p-4">
        <div className="text-center">
          <div className="text-sm mb-2">거스름돈 반환구</div>
          <div
            className={cn(
              "h-20 rounded-md border",
              "flex items-center justify-center",
              "",
              shouldShowChange && ""
            )}
          >
            {shouldShowChange ? (
              <div className="text-center">
                <div className="font-bold">
                  {changeAmount.toLocaleString()}원
                </div>
                <div className="text-xs">거스름돈</div>
              </div>
            ) : (
              <div className="text-sm">거스름돈 반환구</div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
