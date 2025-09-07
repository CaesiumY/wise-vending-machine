import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useAdminStore } from '@/features/admin/store/adminStore';
import { Banknote } from 'lucide-react';
import { CASH_DENOMINATIONS } from '@/features/payment/constants/denominations';
import { formatDenomination } from '@/shared/utils/formatters';

export function CashReserveDisplay() {
  const { cashReserve } = useAdminStore();

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
            const count = cashReserve[denomination] ?? 0;
            return (
              <div
                key={denomination}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-muted-foreground">
                  {formatDenomination(denomination)}
                </span>
                <span className="font-medium">{count}개</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
