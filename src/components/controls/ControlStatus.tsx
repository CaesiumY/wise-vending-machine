import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useVendingStore } from '@/stores/vendingStore'

interface ControlStatusProps {
  className?: string
}

export function ControlStatus({ className }: ControlStatusProps) {
  const { 
    paymentMethod,
    currentBalance,
    selectedProduct,
    products,
    status,
    isOperational
  } = useVendingStore()

  // 선택된 상품 정보
  const selectedProductInfo = selectedProduct ? products[selectedProduct] : null

  // 구매 가능 여부 확인
  const isReady = Boolean(
    selectedProductInfo && 
    currentBalance >= selectedProductInfo.price &&
    selectedProductInfo.stock > 0 &&
    paymentMethod
  )

  // 상태 메시지 생성
  const getStatusMessage = (): string => {
    if (!isOperational) return '시스템 점검 중입니다'
    
    switch (status) {
      case 'idle':
        return '결제 방식을 선택해주세요'
      case 'cash_input':
        return '현금을 투입해주세요'
      case 'card_process':
        return '카드를 삽입하고 결제를 진행해주세요'
      case 'product_select':
        if (!selectedProduct) return '음료를 선택해주세요'
        if (selectedProductInfo && currentBalance < selectedProductInfo.price) {
          return '투입 금액이 부족합니다'
        }
        return '구매 가능합니다'
      case 'dispensing':
        return '음료를 배출하고 있습니다'
      case 'completing':
        return '거래를 완료하고 있습니다'
      case 'maintenance':
        return '시스템 점검 중입니다'
      default:
        return '처리 중...'
    }
  }

  // 상태 색상 결정
  const getStatusColor = (): string => {
    if (!isOperational) return 'text-red-600'
    
    if (isReady) return 'text-green-600'
    if (paymentMethod && currentBalance > 0) return 'text-blue-600'
    if (selectedProductInfo && currentBalance < selectedProductInfo.price) return 'text-orange-600'
    if (status === 'maintenance') return 'text-red-600'
    return 'text-gray-600'
  }

  // 최저 가격 음료
  const minPrice = Math.min(...Object.values(products).map(p => p.price))

  return (
    <Card className={cn("p-3 bg-slate-50", className)}>
      <div className="space-y-2">
        {/* 상태 메시지 */}
        <div className="text-center">
          <p className={cn("text-sm font-medium", getStatusColor())}>
            {getStatusMessage()}
          </p>
        </div>

        {/* 상태 정보 */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex gap-2">
            <Badge variant={paymentMethod === 'cash' ? 'default' : 'secondary'}>
              💵 현금
            </Badge>
            <Badge variant={paymentMethod === 'card' ? 'default' : 'secondary'}>
              💳 카드
            </Badge>
          </div>
          
          <div className="text-right">
            {currentBalance > 0 && (
              <div className="text-green-600 font-medium">
                {currentBalance.toLocaleString()}원
              </div>
            )}
          </div>
        </div>

        {/* 선택된 상품 정보 */}
        {selectedProductInfo && (
          <div className="text-center">
            <div className="text-xs text-gray-600">
              {selectedProductInfo.name} ({selectedProductInfo.price.toLocaleString()}원)
            </div>
            {isReady && (
              <Badge className="bg-green-500 text-white text-xs mt-1">
                구매 가능
              </Badge>
            )}
            {paymentMethod === 'cash' && currentBalance < selectedProductInfo.price && (
              <Badge variant="outline" className="border-orange-500 text-orange-600 text-xs mt-1">
                {(selectedProductInfo.price - currentBalance).toLocaleString()}원 부족
              </Badge>
            )}
          </div>
        )}

        {/* 추가 정보 */}
        {paymentMethod === 'cash' && currentBalance > 0 && !selectedProduct && (
          <div className="text-center">
            <div className="text-xs text-blue-600">
              {currentBalance >= minPrice ? '구매 가능한 음료가 있습니다' : '최소 금액 부족'}
            </div>
            {currentBalance < minPrice && (
              <div className="text-xs text-gray-500">
                (최저가: {minPrice.toLocaleString()}원)
              </div>
            )}
          </div>
        )}

        {/* 진행 상태 표시 */}
        {(status === 'dispensing' || status === 'completing' || status === 'card_process') && (
          <div className="flex items-center justify-center gap-2 py-1">
            <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full" />
            <span className="text-xs text-blue-600">
              {status === 'dispensing' ? '배출 중' : 
               status === 'completing' ? '완료 중' : '처리 중'}
            </span>
          </div>
        )}

        {/* 연속 구매 안내 */}
        {status === 'product_select' && currentBalance > 0 && !selectedProduct && (
          <div className="text-center text-xs text-gray-500">
            💡 연속 구매가 가능합니다
          </div>
        )}
      </div>
    </Card>
  )
}