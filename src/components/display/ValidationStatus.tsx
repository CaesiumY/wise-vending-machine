import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useValidation } from '@/hooks/useValidation';
import { useVendingStore } from '@/stores/vendingStore';

interface StockStatusItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  validation: {
    isValid: boolean;
    reason?: string;
    currentStock: number;
  };
}

export function ValidationStatus() {
  const { selectedProduct, currentBalance } = useVendingStore();
  const { checkStock, checkAdminExceptions, lastValidation, validationErrors } = useValidation();
  const [stockStatus, setStockStatus] = useState<StockStatusItem[]>([]);

  useEffect(() => {
    // 실시간 재고 상태 업데이트
    const updateStockStatus = () => {
      const products = useVendingStore.getState().products;
      const status = Object.values(products).map(product => ({
        ...product,
        validation: checkStock(product.id)
      }));
      setStockStatus(status);
    };

    updateStockStatus();
    // 실시간 업데이트 비활성화
  }, [checkStock]);

  const adminException = checkAdminExceptions();

  return (
    <div className="space-y-2">
      {/* 관리자 예외 상황 표시 */}
      {adminException.hasException && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{adminException.message}</AlertDescription>
        </Alert>
      )}

      {/* 검증 오류 표시 */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {validationErrors[validationErrors.length - 1]}
          </AlertDescription>
        </Alert>
      )}

      {/* 재고 상태 표시 */}
      <div className="flex gap-2 flex-wrap">
        {stockStatus.map(item => (
          <Badge
            key={item.id}
            variant={item.validation.isValid ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            {item.validation.isValid ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {item.name}: {item.validation.currentStock}개
          </Badge>
        ))}
      </div>

      {/* 결제 검증 상태 */}
      {selectedProduct && currentBalance > 0 && (
        <Alert variant={lastValidation?.isValid ? 'default' : 'destructive'}>
          {lastValidation?.isValid ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {lastValidation?.isValid 
              ? '구매 가능합니다.'
              : lastValidation?.reason || '검증 중...'
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}