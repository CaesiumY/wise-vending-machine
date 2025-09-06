import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { ExceptionToggles } from './ExceptionToggles';
import { StockControls } from './StockControls';
import { PresetButtons } from './PresetButtons';
import { cn } from '@/lib/utils';
import { useAdminStore, adminSelectors } from '@/stores/adminStore';
// import { useExceptionHandler } from '@/hooks/useExceptionHandler';

interface AdminPanelProps {
  className?: string;
}

export function AdminPanel({ className }: AdminPanelProps) {
  const { 
    isPanelOpen, 
    activePreset,
    loadPreset, 
    resetToDefault,
    errorCount,
    lastError
  } = useAdminStore();
  
  // const { triggerException } = useExceptionHandler(); // 현재 미사용
  
  // 활성화된 예외 목록 가져오기
  const activeExceptions = adminSelectors.getActiveExceptions();
  const systemStatus = adminSelectors.getSystemStatus();

  return (
    <div className={cn("mt-auto", className)}>
      <Collapsible open={isPanelOpen} onOpenChange={useAdminStore.getState().togglePanel}>
        <CollapsibleTrigger asChild>
          <Card className="p-3 cursor-pointer hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-sm">🔧 관리자 패널</span>
                {activeExceptions.length > 0 && (
                  <Badge 
                    variant={systemStatus.severity === 'critical' ? 'destructive' : 'secondary'} 
                    className="text-xs"
                  >
                    {activeExceptions.length}개 활성
                  </Badge>
                )}
                {activePreset && (
                  <Badge variant="outline" className="text-xs">
                    {activePreset}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{isPanelOpen ? '접기' : '펼치기'}</span>
                {isPanelOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </Card>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 space-y-3">
          {/* 시나리오 프리셋 */}
          <PresetButtons 
            onPresetSelect={loadPreset}
            activePreset={activePreset}
          />

          {/* 예외 상황 토글 */}
          <ExceptionToggles 
            activeExceptions={activeExceptions}
          />

          {/* 재고 조정 */}
          <StockControls />

          {/* 설정 저장/로드 */}
          <Card className="p-3">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs"
                onClick={() => {
                  const settings = useAdminStore.getState();
                  localStorage.setItem('vending-admin-backup', JSON.stringify(settings));
                  useAdminStore.getState().recordError('admin_intervention', '설정이 저장되었습니다');
                }}
              >
                💾 설정 저장
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs"
                onClick={() => {
                  const backup = localStorage.getItem('vending-admin-backup');
                  if (backup) {
                    try {
                      const settings = JSON.parse(backup);
                      useAdminStore.setState(settings);
                      useAdminStore.getState().recordError('admin_intervention', '설정이 복원되었습니다');
                    } catch {
                      useAdminStore.getState().recordError('admin_intervention', '설정 파일이 손상되었습니다');
                    }
                  }
                }}
              >
                📂 설정 불러오기
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs"
                onClick={() => {
                  resetToDefault();
                  useAdminStore.getState().recordError('admin_intervention', '설정이 초기화되었습니다');
                }}
              >
                🔄 초기화
              </Button>
            </div>
          </Card>

          {/* 시스템 상태 표시 */}
          {(errorCount > 0 || lastError) && (
            <Card className="p-3 bg-red-50 border-red-200">
              <div className="flex items-center justify-between">
                <div className="text-xs">
                  <span className="font-medium text-red-700">오류 상태</span>
                  <span className="text-red-600 ml-2">{errorCount}건</span>
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
                <div className="text-xs text-red-600 mt-1">
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