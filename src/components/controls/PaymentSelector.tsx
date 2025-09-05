import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useVendingStore } from '@/stores/vendingStore'
import type { PaymentMethod } from '@/types'

interface PaymentSelectorProps {
  className?: string
}

export function PaymentSelector({ className }: PaymentSelectorProps) {
  const { 
    paymentMethod,
    status,
    setPaymentMethod
  } = useVendingStore()

  // 결제 방식 선택 가능한 상태인지 확인
  const isSelectionDisabled = status !== 'idle'

  // 결제 방식 선택 핸들러
  const handlePaymentSelect = (method: PaymentMethod) => {
    if (isSelectionDisabled) return
    
    const result = setPaymentMethod(method)
    if (!result.success) {
      console.warn('결제 방식 설정 실패:', result.error)
    }
  }

  return (
    <Card className={cn("p-4 mb-4", className)}>
      <h3 className="text-lg font-semibold mb-3 text-center">결제 방식 선택</h3>
      <div className="grid grid-cols-2 gap-3">
        {/* 현금 결제 버튼 */}
        <Button
          variant={paymentMethod === 'cash' ? 'default' : 'outline'}
          className={cn(
            "h-16 flex flex-col items-center gap-1 transition-all duration-200",
            paymentMethod === 'cash' 
              ? "bg-green-500 hover:bg-green-600 text-white" 
              : "hover:bg-green-50",
            isSelectionDisabled && "opacity-50"
          )}
          onClick={() => handlePaymentSelect('cash')}
          disabled={isSelectionDisabled}
        >
          <span className="text-2xl">💵</span>
          <span className="text-sm font-medium">현금 결제</span>
        </Button>
        
        {/* 카드 결제 버튼 */}
        <Button
          variant={paymentMethod === 'card' ? 'default' : 'outline'}
          className={cn(
            "h-16 flex flex-col items-center gap-1 transition-all duration-200",
            paymentMethod === 'card' 
              ? "bg-blue-500 hover:bg-blue-600 text-white" 
              : "hover:bg-blue-50",
            isSelectionDisabled && "opacity-50"
          )}
          onClick={() => handlePaymentSelect('card')}
          disabled={isSelectionDisabled}
        >
          <span className="text-2xl">💳</span>
          <span className="text-sm font-medium">카드 결제</span>
        </Button>
      </div>
      
      {/* 상태 메시지 */}
      <div className="mt-3 text-center">
        {isSelectionDisabled ? (
          <p className="text-sm text-gray-500">
            {paymentMethod ? `${paymentMethod === 'cash' ? '현금' : '카드'} 결제 진행 중` : '처리 중...'}
          </p>
        ) : (
          <p className="text-sm text-gray-600">결제 방식을 선택해주세요</p>
        )}
      </div>
    </Card>
  )
}