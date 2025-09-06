import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAdminStore } from "@/stores/adminStore";
import type { ErrorType, TaskAdminSettings } from "@/types";

// 6개 예외 항목을 단일 리스트로 노출 (shadcn Switch)
const EXCEPTION_ITEMS: Array<{
  id: keyof TaskAdminSettings | "cashRecognitionFault";
  name: string;
  icon?: string;
}> = [
  { id: "changeShortageMode", name: "거스름돈 부족" },
  { id: "cashRecognitionFault", name: "동전/지폐 인식 실패", icon: "🪙" },
  { id: "cardReaderFault", name: "카드 인식 실패" },
  { id: "cardPaymentReject", name: "카드 결제 실패" },
  { id: "dispenseFaultMode", name: "배출 실패", icon: "🚫" },
  { id: "timeoutMode", name: "타임아웃" },
];

interface ExceptionTogglesProps {
  activeExceptions?: ErrorType[];
}

export function ExceptionToggles({
  activeExceptions: _activeExceptions = [],
}: ExceptionTogglesProps) {
  const adminStore = useAdminStore();

  const handleToggle = (
    exceptionKey: keyof TaskAdminSettings | "cashRecognitionFault",
    checked: boolean
  ) => {
    if (exceptionKey === "cashRecognitionFault") {
      const currentBill = adminStore.billJamMode as boolean;
      const currentCoin = adminStore.coinJamMode as boolean;
      // 두 플래그를 모두 동일한 상태로 맞춘다
      if (currentBill !== checked) {
        adminStore.toggleException("billJamMode");
      }
      if (currentCoin !== checked) {
        adminStore.toggleException("coinJamMode");
      }
      return;
    }
    adminStore.toggleException(exceptionKey as keyof TaskAdminSettings);
  };

  // 6개 카테고리 기준 활성 수 계산
  const activeCount =
    (adminStore.changeShortageMode ? 1 : 0) +
    (adminStore.billJamMode || adminStore.coinJamMode ? 1 : 0) +
    (adminStore.cardReaderFault ? 1 : 0) +
    (adminStore.cardPaymentReject ? 1 : 0) +
    (adminStore.dispenseFaultMode ? 1 : 0) +
    (adminStore.timeoutMode ? 1 : 0);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm">예외 상황 시뮬레이터</h4>
        <Badge
          variant={activeCount > 0 ? "destructive" : "secondary"}
          className="text-xs"
        >
          {activeCount}/6 활성
        </Badge>
      </div>

      <div className="space-y-2">
        {EXCEPTION_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-1">
            <Label
              htmlFor={item.id}
              className="text-xs flex items-center gap-2 cursor-pointer"
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Label>
            <Switch
              id={item.id}
              checked={
                item.id === "cashRecognitionFault"
                  ? adminStore.billJamMode || adminStore.coinJamMode
                  : (adminStore[
                      item.id as keyof TaskAdminSettings
                    ] as boolean) || false
              }
              onCheckedChange={(checked) =>
                handleToggle(
                  item.id as keyof TaskAdminSettings | "cashRecognitionFault",
                  checked
                )
              }
              className="scale-75"
            />
          </div>
        ))}
      </div>

      <Separator className="my-3" />

      <div className="text-center">
        <p className="text-xs">
          💡 예외 상황을 활성화하면 실제 자판기에서 해당 오류가 발생합니다
        </p>
      </div>
    </Card>
  );
}
