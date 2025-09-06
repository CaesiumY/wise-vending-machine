import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import { ExceptionToggles } from "./ExceptionToggles";
import { cn } from "@/lib/utils";
import { useAdminStore, adminSelectors } from "@/stores/adminStore";

interface AdminPanelProps {
  className?: string;
}

export function AdminPanel({ className }: AdminPanelProps) {
  const { isPanelOpen, errorCount, lastError } = useAdminStore();

  // const { triggerException } = useExceptionHandler(); // 현재 미사용

  // 활성화된 예외 목록 가져오기
  const activeExceptions = adminSelectors.getActiveExceptions();
  const systemStatus = adminSelectors.getSystemStatus();

  return (
    <div className={cn("mt-auto", className)}>
      <Collapsible
        open={isPanelOpen}
        onOpenChange={useAdminStore.getState().togglePanel}
      >
        <CollapsibleTrigger asChild>
          <Card className="p-3 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium text-sm">테스트 패널</span>
                {activeExceptions.length > 0 && (
                  <Badge
                    variant={
                      systemStatus.status === "critical"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {activeExceptions.length}개 활성
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span>{isPanelOpen ? "접기" : "펼치기"}</span>
                {isPanelOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>
          </Card>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 space-y-3">
          {/* 예외 상황 토글 */}
          <ExceptionToggles activeExceptions={activeExceptions} />


          {/* 시스템 상태 표시 */}
          {(errorCount > 0 || lastError) && (
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs">
                  <span className="font-medium">오류 상태</span>
                  <span className="ml-2">{errorCount}건</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6"
                  onClick={useAdminStore.getState().clearErrorLog}
                >
                  초기화
                </Button>
              </div>
              {lastError && (
                <div className="text-xs mt-1">
                  최근: {lastError.type} - {lastError.message}
                </div>
              )}
            </Card>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
