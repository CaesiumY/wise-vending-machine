import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAdminStore } from "@/stores/adminStore";
import type { ErrorType, TaskAdminSettings } from "@/types";

// 요구사항: 관리자 패널에 남길 오류 케이스 6개만 노출
// - 거스름돈 부족
// - 동전/지폐 인식 실패 (동전/지폐 걸림으로 대표)
// - 카드 인식 실패
// - 카드 결제 실패
// - 배출 실패
// - 타임아웃
const EXCEPTION_CATEGORIES = {
  payment: {
    title: "결제 예외",
    color: "",
    exceptions: [
      { id: "changeShortageMode", name: "거스름돈 부족", icon: "" },
      { id: "cashRecognitionFault", name: "동전/지폐 인식 실패", icon: "🪙" },
    ],
  },
  card: {
    title: "카드 예외",
    color: "",
    exceptions: [
      { id: "cardReaderFault", name: "카드 인식 실패", icon: "" },
      { id: "cardPaymentReject", name: "카드 결제 실패", icon: "" },
    ],
  },
  system: {
    title: "시스템 예외",
    color: "",
    exceptions: [
      { id: "dispenseFaultMode", name: "배출 실패", icon: "🚫" },
      { id: "timeoutMode", name: "타임아웃", icon: "" },
    ],
  },
};

interface ExceptionTogglesProps {
  activeExceptions?: ErrorType[];
}

export function ExceptionToggles({
  activeExceptions = [],
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

  const activeCount = activeExceptions.length;

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

      <div className="space-y-3">
        {Object.entries(EXCEPTION_CATEGORIES).map(([categoryKey, category]) => (
          <Card key={categoryKey} className={`p-3 ${category.color}`}>
            <h5 className="font-medium text-xs mb-2">{category.title}</h5>
            <div className="grid grid-cols-1 gap-2">
              {category.exceptions.map((exception) => (
                <div
                  key={exception.id}
                  className="flex items-center justify-between"
                >
                  <Label
                    htmlFor={exception.id}
                    className="text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>{exception.icon}</span>
                    <span>{exception.name}</span>
                  </Label>
                  <Switch
                    id={exception.id}
                    checked={
                      exception.id === "cashRecognitionFault"
                        ? adminStore.billJamMode || adminStore.coinJamMode
                        : (adminStore[
                            exception.id as keyof TaskAdminSettings
                          ] as boolean) || false
                    }
                    onCheckedChange={(checked) =>
                      handleToggle(
                        exception.id as
                          | keyof TaskAdminSettings
                          | "cashRecognitionFault",
                        checked
                      )
                    }
                    className="scale-75"
                  />
                </div>
              ))}
            </div>
          </Card>
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
