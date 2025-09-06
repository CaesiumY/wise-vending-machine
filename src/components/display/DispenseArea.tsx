import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useVendingStore } from "@/stores/vendingStore";

interface DispenseAreaProps {
  className?: string;
}

export function DispenseArea({ className }: DispenseAreaProps) {
  const { status, lastTransaction, paymentMethod } = useVendingStore();

  // 거스름돈 표시 (현금 결제시만)
  const changeAmount =
    paymentMethod === "cash" && lastTransaction?.change
      ? lastTransaction.change
      : 0;
  const shouldShowChange =
    changeAmount > 0 && (status === "completing" || status === "idle");

  return (
    <div className={cn("mt-auto", className)}>
      {/* 거스름돈 반환구만 유지 */}
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
