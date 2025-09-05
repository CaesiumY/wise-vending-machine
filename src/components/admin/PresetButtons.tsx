import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Preset {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  config: {
    exceptions: string[];
    stocks: Record<string, number>;
  };
}

const SCENARIO_PRESETS: Preset[] = [
  {
    id: 'normal',
    name: '정상 작동',
    icon: '✅',
    description: '모든 기능 정상 상태',
    color: 'bg-green-500 hover:bg-green-600',
    config: {
      exceptions: [],
      stocks: { cola: 5, water: 5, coffee: 5 }
    }
  },
  {
    id: 'change-shortage',
    name: '거스름돈 부족',
    icon: '💰',
    description: '거스름돈 부족 상황 시뮬레이션',
    color: 'bg-orange-500 hover:bg-orange-600',
    config: {
      exceptions: ['changeShortageMode'],
      stocks: { cola: 5, water: 3, coffee: 2 }
    }
  },
  {
    id: 'stock-shortage',
    name: '재고 소진',
    icon: '📦',
    description: '일부 음료 품절 상황',
    color: 'bg-red-500 hover:bg-red-600',
    config: {
      exceptions: [],
      stocks: { cola: 2, water: 0, coffee: 1 }
    }
  },
  {
    id: 'system-error',
    name: '시스템 오류',
    icon: '🚨',
    description: '배출 실패 + 카드 오류',
    color: 'bg-purple-500 hover:bg-purple-600',
    config: {
      exceptions: ['dispenseFaultMode', 'cardReaderFault'],
      stocks: { cola: 3, water: 3, coffee: 3 }
    }
  },
  {
    id: 'worst-case',
    name: '최악 상황',
    icon: '💀',
    description: '모든 오류 동시 활성화',
    color: 'bg-black hover:bg-gray-800',
    config: {
      exceptions: [
        'changeShortageMode', 'fakeMoneyDetection', 'billJamMode', 
        'dispenseFaultMode', 'cardReaderFault', 'networkErrorMode',
        'timeoutMode', 'powerUnstableMode'
      ],
      stocks: { cola: 0, water: 1, coffee: 0 }
    }
  }
];

interface PresetButtonsProps {
  onPresetSelect?: (preset: Preset) => void;
  selectedPreset?: string | null;
}

export function PresetButtons({ onPresetSelect, selectedPreset }: PresetButtonsProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm">🎯 시나리오 프리셋</h4>
        <span className="text-xs text-gray-600">원클릭 테스트</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {SCENARIO_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            onClick={() => onPresetSelect?.(preset)}
            className={cn(
              "h-auto p-3 flex items-start gap-3 text-left text-white",
              preset.color,
              selectedPreset === preset.id && "ring-2 ring-offset-2 ring-white"
            )}
          >
            <span className="text-xl">{preset.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{preset.name}</div>
              <div className="text-xs opacity-90">{preset.description}</div>
              <div className="flex gap-1 mt-1">
                {preset.config.exceptions.length > 0 && (
                  <span className="text-xs bg-white/20 px-1 rounded">
                    {preset.config.exceptions.length}개 예외
                  </span>
                )}
                <span className="text-xs bg-white/20 px-1 rounded">
                  재고 설정
                </span>
              </div>
            </div>
          </Button>
        ))}
      </div>

      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-center">
        <p className="text-xs text-blue-700">
          💡 프리셋을 선택하면 해당 시나리오에 맞는 설정이 자동 적용됩니다
        </p>
      </div>
    </Card>
  );
}