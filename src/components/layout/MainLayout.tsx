import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-100 to-slate-200",
      "flex items-center justify-center p-4",
      className
    )}>
      <div className={cn(
        // 자판기 컨테이너 - 기본 레이아웃
        "w-full max-w-6xl mx-auto",
        "rounded-2xl shadow-2xl overflow-hidden",
        "bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900",
        "border-4 border-blue-700",
        // 반응형 크기 조정
        "lg:max-w-6xl md:max-w-md sm:max-w-sm"
      )}>
        {children}
      </div>
    </div>
  );
}

interface VendingLayoutProps {
  vendingDisplay: ReactNode;
  controlPanel: ReactNode;
}

export function VendingLayout({ vendingDisplay, controlPanel }: VendingLayoutProps) {
  return (
    <div className={cn(
      // 메인 패널 - 2분할 그리드
      "grid grid-cols-1 lg:grid-cols-2 min-h-[600px]"
    )}>
      {/* 자판기 본체 */}
      <div className={cn(
        // 자판기 디스플레이 영역
        "bg-gradient-to-br from-blue-800 to-blue-900",
        "p-6 lg:p-6 md:p-4 sm:p-4",
        "lg:border-r border-blue-700",
        "lg:border-b-0 border-b border-blue-700",
        "flex flex-col justify-between"
      )}>
        {vendingDisplay}
      </div>
      
      {/* 컨트롤 패널 */}
      <div className={cn(
        // 컨트롤 패널 영역
        "bg-gradient-to-br from-slate-50 to-slate-100",
        "p-6 lg:p-6 md:p-4 sm:p-4",
        "flex flex-col gap-4"
      )}>
        {controlPanel}
      </div>
    </div>
  );
}