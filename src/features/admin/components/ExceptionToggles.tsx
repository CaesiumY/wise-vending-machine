import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { EXCEPTION_TOGGLES } from "@/features/admin/constants/adminConfig";
import { useAdminStore } from "@/features/admin/store/adminStore";
import type { AdminSettings } from "@/features/admin/types/admin.types";

export function ExceptionToggles() {
  const adminStore = useAdminStore();

  const handleToggle = (
    exceptionKey: keyof AdminSettings,
    _checked: boolean
  ) => {
    adminStore.toggleException(exceptionKey);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">예외 상황 시뮬레이터</h4>
      </div>

      <div className="space-y-2">
        {EXCEPTION_TOGGLES.map((toggle) => (
          <div
            key={toggle.key}
            className="flex items-center justify-between py-1"
          >
            <div>
              <Label htmlFor={toggle.key} className="text-xs cursor-pointer">
                {toggle.label}
              </Label>
              <p className="text-[10px] text-muted-foreground">
                {toggle.description}
              </p>
            </div>
            <Switch
              id={toggle.key}
              checked={
                (adminStore[
                  toggle.key as keyof AdminSettings
                ] as boolean) || false
              }
              onCheckedChange={(checked) =>
                handleToggle(toggle.key as keyof AdminSettings, checked)
              }
              className="scale-75"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
