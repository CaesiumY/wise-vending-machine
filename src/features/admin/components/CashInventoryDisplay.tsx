import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { Banknote } from "lucide-react";
import { cn } from "@/shared/utils/ui";
import type { CashDenomination } from "@/shared/types/common.types";

const CASH_DENOMINATIONS: CashDenomination[] = [10000, 5000, 1000, 500, 100];

const formatDenomination = (denomination: number): string => {
  return denomination >= 1000 
    ? `${denomination / 1000}천원`
    : `${denomination}원`;
};

const getStockStatusColor = (count: number): string => {
  if (count === 0) return "text-red-500";
  if (count <= 2) return "text-orange-500";
  return "text-foreground";
};

export function CashInventoryDisplay() {
  const { cashInventory } = useAdminStore();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Banknote className="h-4 w-4" />
          화폐 재고
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {CASH_DENOMINATIONS.map((denomination) => {
            const count = cashInventory[denomination] || 0;
            return (
              <div
                key={denomination}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-muted-foreground">
                  {formatDenomination(denomination)}
                </span>
                <span className={cn("font-medium", getStockStatusColor(count))}>
                  {count}개
                </span>
              </div>
            );
          })}
        </div>
        
        {/* 총 화폐 가치 표시 */}
        <div className="pt-3 mt-3 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">총 보유 금액</span>
            <span className="font-medium">
              {CASH_DENOMINATIONS.reduce((total, denomination) => {
                return total + (cashInventory[denomination] || 0) * denomination;
              }, 0).toLocaleString()}원
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}