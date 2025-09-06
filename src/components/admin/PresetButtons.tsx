import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SCENARIO_PRESETS } from '@/stores/adminStore';
import type { PresetName } from '@/types';

// 프리셋별 색상 및 아이콘 매핑
const PRESET_STYLES: Record<PresetName, { color: string; icon: string }> = {
  normal: { color: 'bg-green-500 hover:bg-green-600', icon: '✅' },
  change_shortage: { color: 'bg-orange-500 hover:bg-orange-600', icon: '💰' },
  stock_shortage: { color: 'bg-red-500 hover:bg-red-600', icon: '📦' },
  system_error: { color: 'bg-purple-500 hover:bg-purple-600', icon: '🚨' },
  worst_case: { color: 'bg-black hover:bg-gray-800', icon: '💀' }
};

interface PresetButtonsProps {
  onPresetSelect?: (preset: PresetName) => void;
  activePreset?: PresetName | null;
}

export function PresetButtons({ onPresetSelect, activePreset }: PresetButtonsProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm">🎯 시나리오 프리셋</h4>
        <span className="text-xs text-gray-600">원클릭 테스트</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {SCENARIO_PRESETS.map((preset) => {
          const style = PRESET_STYLES[preset.name];
          
          return (
            <Button
              key={preset.name}
              onClick={() => onPresetSelect?.(preset.name)}
              className={cn(
                "h-auto p-3 flex items-start gap-3 text-left text-white",
                style.color,
                activePreset === preset.name && "ring-2 ring-offset-2 ring-white"
              )}
            >
              <span className="text-xl">{style.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{preset.displayName}</div>
                <div className="text-xs opacity-90">{preset.description}</div>
                <div className="flex gap-1 mt-1">
                  <span className="text-xs bg-white/20 px-1 rounded">
                    재고 설정
                  </span>
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-center">
        <p className="text-xs text-blue-700">
          💡 프리셋을 선택하면 해당 시나리오에 맞는 설정이 자동 적용됩니다
        </p>
      </div>
    </Card>
  );
}