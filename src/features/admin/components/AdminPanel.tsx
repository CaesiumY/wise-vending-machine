import { Card } from '@/shared/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import { cn } from '@/shared/utils/ui';
import { ChevronDown, Settings } from 'lucide-react';
import { ExceptionToggles } from './ExceptionToggles';
import { CashReserveDisplay } from './CashReserveDisplay';

interface AdminPanelProps {
  className?: string;
}

export function AdminPanel({ className }: AdminPanelProps) {
  return (
    <div className={cn('mt-auto', className)}>
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
          {/* 화폐 재고 표시 */}
          <CashReserveDisplay />

          {/* 예외 상황 토글 */}
          <ExceptionToggles />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
