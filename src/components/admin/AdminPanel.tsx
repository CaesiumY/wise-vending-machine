import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { adminSelectors, useAdminStore } from "@/stores/adminStore";
import { ChevronDown, Settings } from "lucide-react";
import { ExceptionToggles } from "./ExceptionToggles";

interface AdminPanelProps {
  className?: string;
}

export function AdminPanel({ className }: AdminPanelProps) {

  // 활성화된 예외 목록 가져오기
  const activeExceptions = adminSelectors.getActiveExceptions();

  return (
    <div className={cn("mt-auto", className)}>
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger asChild>
          <Card className="p-3 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium text-sm">테스트 패널</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </Card>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 space-y-3">
          {/* 예외 상황 토글 */}
          <ExceptionToggles activeExceptions={activeExceptions} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
