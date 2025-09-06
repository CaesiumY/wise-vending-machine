import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/stores/adminStore';
import type { ProductType } from '@/types';

interface Product {
  id: ProductType;
  name: string;
  price: number;
  icon: string;
}

const PRODUCTS: Product[] = [
  { id: 'cola', name: '콜라', price: 1100, icon: '🥤' },
  { id: 'water', name: '물', price: 600, icon: '💧' },
  { id: 'coffee', name: '커피', price: 700, icon: '☕' },
];

export function StockControls() {
  const { stockLevels, updateStockLevel } = useAdminStore();

  const updateStock = (productId: ProductType, change: number) => {
    const currentStock = stockLevels[productId];
    const newStock = Math.max(0, Math.min(99, currentStock + change));
    updateStockLevel(productId, newStock);
  };

  const setStock = (productId: ProductType, stock: number) => {
    const numStock = Math.max(0, Math.min(99, parseInt(String(stock)) || 0));
    updateStockLevel(productId, numStock);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-800', text: '품절' };
    if (stock <= 2) return { color: 'bg-orange-100 text-orange-800', text: '부족' };
    if (stock >= 10) return { color: 'bg-blue-100 text-blue-800', text: '풍부' };
    return { color: 'bg-green-100 text-green-800', text: '정상' };
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm">📦 재고 관리</h4>
        <Badge variant="outline" className="text-xs">
          실시간 조정
        </Badge>
      </div>

      <div className="space-y-3">
        {PRODUCTS.map((product) => {
          const currentStock = stockLevels[product.id];
          const status = getStockStatus(currentStock);
          
          return (
            <Card key={product.id} className="p-3 bg-white border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{product.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-gray-600">
                      {product.price.toLocaleString()}원
                    </div>
                  </div>
                </div>
                <Badge className={cn("text-xs", status.color)}>
                  {status.text}
                </Badge>
              </div>

              {/* 재고 조정 컨트롤 */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => updateStock(product.id, -1)}
                  disabled={currentStock === 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <div className="flex-1 flex items-center gap-2">
                  <Label className="text-xs whitespace-nowrap">재고:</Label>
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    value={currentStock}
                    onChange={(e) => setStock(product.id, parseInt(e.target.value) || 0)}
                    className="h-8 text-center text-sm"
                  />
                  <span className="text-xs text-gray-600">개</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => updateStock(product.id, 1)}
                  disabled={currentStock >= 99}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* 빠른 설정 버튼 */}
              <div className="flex gap-1 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setStock(product.id, 0)}
                >
                  품절
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setStock(product.id, 1)}
                >
                  1개
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setStock(product.id, 5)}
                >
                  5개
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setStock(product.id, 10)}
                >
                  10개
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-3 text-center">
        <p className="text-xs text-gray-600">
          💡 재고를 0으로 설정하면 해당 음료가 품절됩니다
        </p>
      </div>
    </Card>
  );
}