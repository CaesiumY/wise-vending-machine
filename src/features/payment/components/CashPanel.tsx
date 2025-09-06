import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/ui";
import { useVendingStore } from "@/features/machine/store/vendingStore";
import type { CashDenomination } from "@/shared/types/common.types";

interface CashPanelProps {
  className?: string;
}

// 화폐 단위별 정보
const cashDenominations: Array<{
  value: CashDenomination;
  label: string;
}> = [
  { value: 10000, label: "1만원" },
  { value: 5000, label: "5천원" },
  { value: 1000, label: "1천원" },
  { value: 500, label: "500원" },
  { value: 100, label: "100원" },
];

export function CashPanel({ className }: CashPanelProps) {
  const {
    currentBalance,
    status,
    paymentMethod,
    insertCash,
    cancelTransaction,
  } = useVendingStore();

  // 현금 투입 가능 상태 확인
  const isVisible = paymentMethod === "cash";
  const isDisabled =
    status === "dispensing" ||
    status === "completing" ||
    status === "maintenance";
  const canInsertCash = status === "cash_input" || status === "product_select";

  // 현금 투입 핸들러
  const handleCashInsert = (amount: CashDenomination) => {
    if (!canInsertCash) return;

    insertCash(amount);
  };

  // 반환 버튼 핸들러
  const handleReturn = () => {
    if (currentBalance > 0) {
      cancelTransaction();
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
          {cashDenominations.map((cash) => (
            <Button
              key={cash.value}
              className={cn(
                "h-16 flex flex-col items-center justify-center gap-1",
                "font-bold"
              )}
              onClick={() => handleCashInsert(cash.value)}
              disabled={isDisabled || !canInsertCash}
            >
              <span className="text-lg">{cash.value.toLocaleString()}</span>
              <span className="text-xs">{cash.label}</span>
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
        {!canInsertCash && currentBalance === 0 && (
          <div className="text-center">
            <Badge variant="secondary" className="text-sm">
              {status === "idle" ? "결제 방식을 선택해주세요" : "처리 중..."}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
