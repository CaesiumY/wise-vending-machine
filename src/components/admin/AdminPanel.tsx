import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { ExceptionToggles } from './ExceptionToggles';
import { StockControls } from './StockControls';
import { PresetButtons } from './PresetButtons';
import { cn } from '@/lib/utils';

interface AdminPanelProps {
  className?: string;
}

export function AdminPanel({ className }: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeExceptions, setActiveExceptions] = useState<string[]>([]);

  return (
    <div className={cn("mt-auto", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Card className="p-3 cursor-pointer hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-sm">🔧 관리자 패널</span>
                {activeExceptions.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {activeExceptions.length}개 활성
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{isOpen ? '접기' : '펼치기'}</span>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </Card>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 space-y-3">
          {/* 시나리오 프리셋 */}
          <PresetButtons 
            onPresetSelect={(preset) => {
              console.log('Preset selected:', preset);
              // Phase 4에서 스토어 연동 예정
            }}
          />

          {/* 예외 상황 토글 */}
          <ExceptionToggles 
            onToggleChange={(exceptions) => {
              setActiveExceptions(exceptions);
              console.log('Active exceptions:', exceptions);
              // Phase 4에서 스토어 연동 예정
            }}
          />

          {/* 재고 조정 */}
          <StockControls 
            onStockChange={(productId, stock) => {
              console.log('Stock changed:', productId, stock);
              // Phase 4에서 스토어 연동 예정
            }}
          />

          {/* 설정 저장/로드 */}
          <Card className="p-3">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs">
                💾 설정 저장
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs">
                📂 설정 불러오기
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs">
                🔄 초기화
              </Button>
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}