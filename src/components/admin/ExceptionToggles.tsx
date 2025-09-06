import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminStore } from "@/stores/adminStore";
import type { ErrorType, TaskAdminSettings } from "@/types";

const EXCEPTION_ITEMS: Array<{
  id: keyof TaskAdminSettings;
  name: string;
}> = [
  { id: "changeShortageMode", name: "거스름돈 부족" },
  { id: "cardReaderFault", name: "카드 인식 실패" },
  { id: "cardPaymentReject", name: "카드 결제 실패" },
  { id: "dispenseFaultMode", name: "배출 실패" },
];

interface ExceptionTogglesProps {
  activeExceptions?: ErrorType[];
}

export function ExceptionToggles({
  activeExceptions: _activeExceptions = [],
}: ExceptionTogglesProps) {
  const adminStore = useAdminStore();

  const handleToggle = (
    exceptionKey: keyof TaskAdminSettings,
    _checked: boolean
  ) => {
    adminStore.toggleException(exceptionKey);
  };

  // 4개 카테고리 기준 활성 수 계산
  const activeCount =
    (adminStore.changeShortageMode ? 1 : 0) +
    (adminStore.cardReaderFault ? 1 : 0) +
    (adminStore.cardPaymentReject ? 1 : 0) +
    (adminStore.dispenseFaultMode ? 1 : 0);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm">예외 상황 시뮬레이터</h4>
        <Badge
          variant={activeCount > 0 ? "destructive" : "secondary"}
          className="text-xs"
        >
          {activeCount}/4 활성
        </Badge>
      </div>

      <div className="space-y-2">
        {EXCEPTION_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-1">
            <Label
              htmlFor={item.id}
              className="text-xs cursor-pointer"
            >
              {item.name}
            </Label>
            <Switch
              id={item.id}
              checked={
                (adminStore[item.id] as boolean) || false
              }
              onCheckedChange={(checked) =>
                handleToggle(item.id, checked)
              }
              className="scale-75"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
