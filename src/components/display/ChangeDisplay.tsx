import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { useChangeCalculator } from "@/hooks/useChangeCalculator";
import type { CashDenomination, ChangeCalculationResult } from "@/types";

interface ChangeDisplayProps {
  changeAmount: number;
  isVisible: boolean;
}

export function ChangeDisplay({ changeAmount, isVisible }: ChangeDisplayProps) {
  const { calculateChange, getInventoryStatus, currentInventory } =
    useChangeCalculator();
  const [changeResult, setChangeResult] =
    useState<ChangeCalculationResult | null>(null);
  const [inventoryStatus, setInventoryStatus] = useState<ReturnType<
    typeof getInventoryStatus
  > | null>(null);

  useEffect(() => {
    if (isVisible && changeAmount > 0) {
      calculateChange(changeAmount).then(setChangeResult);
    }
    setInventoryStatus(getInventoryStatus());
  }, [changeAmount, isVisible, calculateChange, getInventoryStatus]);

  if (!isVisible || changeAmount === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">거스름돈 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 거스름돈 총액 */}
        <div className="text-center">
          <p className="text-2xl font-bold">
            {changeAmount.toLocaleString()}원
          </p>
          <p className="text-sm text-muted-foreground">반환 예정 금액</p>
        </div>

        {/* 거스름돈 세부 내역 */}
        {changeResult && (
          <div className="space-y-2">
            <p className="font-medium">거스름돈 구성:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(changeResult.breakdown)
                .filter(([_, count]) => count > 0)
                .map(([denomination, count]) => (
                  <div
                    key={denomination}
                    className="flex justify-between items-center p-2 rounded"
                  >
                    <span>{Number(denomination).toLocaleString()}원</span>
                    <Badge variant="secondary">{count}개</Badge>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 지급 불가능한 경우 */}
        {changeResult && !changeResult.canProvideChange && (
          <div className="text-center p-4 rounded-lg border">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">거스름돈 부족</p>
            <p className="text-sm">
              {changeResult.remainingAmount?.toLocaleString()}원을 반환할 수
              없습니다
            </p>
            <p className="text-xs mt-1">정확한 금액을 투입해주세요</p>
          </div>
        )}

        {/* 재고 경고 */}
        {inventoryStatus?.shortageWarning && (
          <div className="p-2 rounded text-center">
            <p className="text-xs">화폐 재고 부족 주의</p>
          </div>
        )}

        {/* 현재 화폐 보유량 (관리자용 정보) */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>현재 보유량:</p>
          <div className="grid grid-cols-5 gap-1 text-center">
            {([10000, 5000, 1000, 500, 100] as CashDenomination[]).map(
              (denomination) => (
                <div key={denomination} className="p-1 rounded">
                  <div className="font-medium">
                    {denomination >= 1000
                      ? `${denomination / 1000}K`
                      : denomination}
                  </div>
                  <div className={`text-xs`}>
                    {currentInventory[denomination]}개
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
