import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAdminStore } from "@/stores/adminStore";
import type { ErrorType, TaskAdminSettings } from "@/types";

// 15가지 예외 상황 정의
const EXCEPTION_CATEGORIES = {
  payment: {
    title: "결제 예외",
    color: "",
    exceptions: [
      { id: "changeShortageMode", name: "거스름돈 부족", icon: "" },
      { id: "fakeMoneyDetection", name: "위조화폐 감지", icon: "🚫" },
      { id: "billJamMode", name: "지폐 걸림", icon: "📄" },
      { id: "coinJamMode", name: "동전 걸림", icon: "🪙" },
    ],
  },
  system: {
    title: "시스템 예외",
    color: "",
    exceptions: [
      { id: "dispenseFaultMode", name: "배출 실패", icon: "🚫" },
      { id: "cardReaderFault", name: "카드 인식 실패", icon: "" },
      { id: "cardPaymentReject", name: "카드 결제 거부", icon: "" },
      { id: "networkErrorMode", name: "네트워크 오류", icon: "" },
      { id: "systemMaintenanceMode", name: "시스템 점검", icon: "" },
    ],
  },
  mechanical: {
    title: "기계적 예외",
    color: "",
    exceptions: [
      { id: "timeoutMode", name: "타임아웃", icon: "" },
      { id: "dispenseBlockedMode", name: "배출구 막힘", icon: "" },
      { id: "temperatureErrorMode", name: "온도 이상", icon: "" },
      { id: "powerUnstableMode", name: "전원 불안정", icon: "" },
      { id: "adminInterventionMode", name: "관리자 개입 필요", icon: "" },
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
    exceptionKey: keyof TaskAdminSettings,
    _checked: boolean
  ) => {
    adminStore.toggleException(exceptionKey);
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
          {activeCount}/15 활성
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
                      (adminStore[
                        exception.id as keyof TaskAdminSettings
                      ] as boolean) || false
                    }
                    onCheckedChange={(checked) =>
                      handleToggle(
                        exception.id as keyof TaskAdminSettings,
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
