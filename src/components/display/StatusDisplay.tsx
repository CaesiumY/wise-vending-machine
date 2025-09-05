import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useVendingStore } from '@/stores/vendingStore'
import type { VendingStatus } from '@/types'

interface StatusDisplayProps {
  className?: string
}

export function StatusDisplay({ className }: StatusDisplayProps) {
  const { 
    currentBalance,
    selectedProduct,
    paymentMethod,
    status,
    products,
    errorMessage,
    currentError
  } = useVendingStore()

  // 선택된 제품 정보
  const selectedProductInfo = selectedProduct ? products[selectedProduct] : null

  // 상태별 색상 반환
  const getStatusColor = (status: VendingStatus) => {
    switch (status) {
      case 'idle': 
        return 'text-blue-400'
      case 'cash_input':
      case 'product_select': 
        return 'text-green-400'
      case 'card_process':
        return 'text-yellow-400'
      case 'dispensing':
      case 'completing': 
        return 'text-orange-400'
      case 'maintenance': 
        return 'text-red-400'
      default: 
        return 'text-gray-400'
    }
  }

  // 상태별 메시지 반환
  const getStatusMessage = () => {
    if (currentError && errorMessage) {
      return errorMessage
    }

    switch (status) {
      case 'idle':
        return '음료를 선택해주세요'
      case 'cash_input':
        return '현금을 투입해주세요'
      case 'product_select':
        return '구매할 음료를 선택해주세요'
      case 'card_process':
        return '카드를 삽입해주세요'
      case 'dispensing':
        return '음료를 배출하고 있습니다...'
      case 'completing':
        return '거래를 완료하고 있습니다...'
      case 'maintenance':
        return '시스템 점검 중입니다'
      default:
        return '준비 중입니다...'
    }
  }

  return (
    <Card className={cn("bg-black/90 text-white p-4 mb-4", className)}>
      <div className="space-y-3">
        {/* 상태 메시지 */}
        <div className="text-center">
          <p className={cn("text-lg font-semibold", getStatusColor(status))}>
            {getStatusMessage()}
          </p>
        </div>

        {/* 투입 금액 표시 */}
        <div className="flex justify-between items-center bg-blue-900/50 rounded p-3">
          <span className="text-blue-300">투입금액</span>
          <span className="text-2xl font-bold text-green-400">
            {currentBalance.toLocaleString()}원
          </span>
        </div>

        {/* 선택된 음료 정보 */}
        {selectedProductInfo && (
          <div className="flex justify-between items-center bg-green-900/50 rounded p-3">
            <span className="text-green-300">선택한 음료</span>
            <div className="text-right">
              <div className="text-lg font-semibold text-white">
                {selectedProductInfo.name}
              </div>
              <div className="text-green-400">
                {selectedProductInfo.price.toLocaleString()}원
              </div>
            </div>
          </div>
        )}

        {/* 잔액 확인 (현금 결제시) */}
        {paymentMethod === 'cash' && selectedProductInfo && currentBalance >= selectedProductInfo.price && (
          <div className="flex justify-between items-center bg-yellow-900/50 rounded p-3">
            <span className="text-yellow-300">거스름돈</span>
            <div className="text-right">
              <div className="text-lg font-semibold text-yellow-400">
                {(currentBalance - selectedProductInfo.price).toLocaleString()}원
              </div>
            </div>
          </div>
        )}

        {/* 결제 방식 표시 */}
        <div className="flex justify-center gap-2">
          <Badge 
            variant={paymentMethod === 'cash' ? 'default' : 'outline'}
            className={cn(
              "text-sm",
              paymentMethod === 'cash' 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'text-gray-400 border-gray-600'
            )}
          >
            💵 현금
          </Badge>
          <Badge 
            variant={paymentMethod === 'card' ? 'default' : 'outline'}
            className={cn(
              "text-sm",
              paymentMethod === 'card' 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'text-gray-400 border-gray-600'
            )}
          >
            💳 카드
          </Badge>
        </div>

        {/* 에러 상태 표시 */}
        {currentError && (
          <div className="bg-red-900/50 border border-red-700 rounded p-3">
            <div className="flex items-center gap-2">
              <span className="text-red-400">⚠️</span>
              <span className="text-red-300 text-sm">오류 발생</span>
            </div>
          </div>
        )}

        {/* 진행 상태 표시 (배출 중일 때) */}
        {(status === 'dispensing' || status === 'completing') && (
          <div className="bg-orange-900/50 rounded p-3">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-4 w-4 border-2 border-orange-400 border-t-transparent rounded-full"></div>
              <span className="text-orange-300 text-sm">
                {status === 'dispensing' ? '음료 배출 중...' : '거래 완료 중...'}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}