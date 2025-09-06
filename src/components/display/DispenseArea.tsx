import { cn } from "@/lib/utils";

interface DispenseAreaProps {
  className?: string;
}

export function DispenseArea({ className }: DispenseAreaProps) {
  // 거스름돈 반환구 UI 제거 - 토스트로 대체
  return (
    <div className={cn("mt-auto", className)}>
      {/* 음료 배출구만 유지 */}
      <div className="p-4 border rounded-lg bg-card">
        <div className="text-center">
          <div className="text-sm mb-2">음료 배출구</div>
          <div className="h-20 rounded-md border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
            <div className="text-xs text-muted-foreground">
              음료가 나오는 곳
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
