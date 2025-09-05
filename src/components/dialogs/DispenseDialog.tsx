import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DispenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'success' | 'failure';
  product?: {
    name: string;
    price: number;
    id: string;
  };
  changeAmount?: number;
  errorMessage?: string;
}

export function DispenseDialog({
  open,
  onOpenChange,
  type,
  product,
  changeAmount = 0,
  errorMessage
}: DispenseDialogProps) {
  const isSuccess = type === 'success';

  const getIcon = () => {
    if (isSuccess) {
      return product?.id === 'cola' ? '🥤' : product?.id === 'water' ? '💧' : '☕';
    }
    return '❌';
  };

  const getTitle = () => {
    return isSuccess ? '🎉 배출 완료!' : '⚠️ 배출 실패';
  };

  const getDescription = () => {
    if (isSuccess) {
      return `${product?.name}이(가) 성공적으로 배출되었습니다.`;
    }
    return errorMessage || '음료 배출에 실패했습니다. 잠시 후 다시 시도해주세요.';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-md",
        isSuccess ? "border-green-200" : "border-red-200"
      )}>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={cn(
              "text-6xl p-4 rounded-full",
              isSuccess ? "bg-green-100" : "bg-red-100"
            )}>
              {getIcon()}
            </div>
          </div>
          <DialogTitle className={cn(
            "text-xl",
            isSuccess ? "text-green-700" : "text-red-700"
          )}>
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {/* 배출 성공 시 상세 정보 */}
        {isSuccess && product && (
          <div className="space-y-3 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-green-800">구매한 음료</span>
                <Badge className="bg-green-500 text-white">
                  {product.name}
                </Badge>
              </div>
              <div className="text-sm text-green-600">
                가격: {product.price.toLocaleString()}원
              </div>
            </div>

            {changeAmount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-800">거스름돈</span>
                  <Badge className="bg-blue-500 text-white text-lg">
                    {changeAmount.toLocaleString()}원
                  </Badge>
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  💰 거스름돈 반환구에서 가져가세요
                </div>
              </div>
            )}
          </div>
        )}

        {/* 배출 실패 시 복구 안내 */}
        {!isSuccess && (
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">복구 안내</h4>
              <ul className="text-sm text-red-600 space-y-1">
                <li>• 투입하신 금액은 자동으로 반환됩니다</li>
                <li>• 재고가 복구되었습니다</li>
                <li>• 잠시 후 다시 시도해주세요</li>
              </ul>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-center">
          <Button
            onClick={() => onOpenChange(false)}
            className={cn(
              "w-full sm:w-auto px-8",
              isSuccess 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-red-500 hover:bg-red-600"
            )}
          >
            {isSuccess ? '✅ 확인' : '🔄 다시 시도'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}