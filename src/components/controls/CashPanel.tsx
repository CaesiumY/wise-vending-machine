import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useVendingStore } from "@/stores/vendingStore";
import type { CashDenomination } from "@/types";

interface CashPanelProps {
  className?: string;
}

// 화폐 단위별 정보
const cashDenominations: Array<{
  value: CashDenomination;
  label: string;
  color: string;
}> = [
  { value: 10000, label: "1만원", color: "" },
  { value: 5000, label: "5천원", color: "" },
  { value: 1000, label: "1천원", color: "" },
  { value: 500, label: "500원", color: "" },
  { value: 100, label: "100원", color: "" },
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

    const result = insertCash(amount);
    if (!result.success) {
      console.warn("현금 투입 실패:", result.error);
    }
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
          <p className="text-sm text-gray-600">지폐나 동전을 선택해주세요</p>
        </div>

        {/* 현금 투입 버튼들 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {cashDenominations.map((cash) => (
            <Button
              key={cash.value}
              className={cn(
                "h-16 flex flex-col items-center justify-center gap-1",
                "font-bold",
                cash.color
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

        {/* 현재 잔액 표시 */}
        <div className="rounded-md p-3 border">
          <div className="flex justify-between items-center">
            <span className="font-medium">현재 투입금액</span>
            <Badge className="text-lg px-3 py-1">
              {currentBalance.toLocaleString()}원
            </Badge>
          </div>
        </div>

        {/* 투입 안내 */}
        <div className="text-center text-xs text-gray-500">
          <p>투입한 금액만큼 음료 선택이 가능합니다</p>
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
