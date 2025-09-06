import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * MainLayout - 애플리케이션 전체 레이아웃
 * 자판기 컨테이너의 외부 껍데기를 담당
 */
export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100",
        "flex items-center justify-center p-4",
        className
      )}
    >
      <div
        className={cn(
          // 자판기 컨테이너 - 기본 레이아웃
          "w-full max-w-6xl mx-auto",
          "rounded-2xl shadow-2xl overflow-hidden",
          // 중립 톤의 카드형 컨테이너
          "bg-card text-card-foreground",
          "border border-border"
        )}
      >
        {children}
      </div>
    </div>
  );
}
