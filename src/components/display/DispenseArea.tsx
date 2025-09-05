import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useVendingStore } from '@/stores/vendingStore'
import { PRODUCT_IMAGES } from '@/constants/products'

interface DispenseAreaProps {
  className?: string
}

export function DispenseArea({ className }: DispenseAreaProps) {
  const { 
    status,
    lastTransaction,
    paymentMethod
  } = useVendingStore()

  // 배출 상태 확인
  const isDispensing = status === 'dispensing'
  const isCompleting = status === 'completing'
  
  // 최근 배출된 음료
  const lastDispensedProduct = lastTransaction?.productId
  
  // 거스름돈 표시 (현금 결제시만)
  const changeAmount = paymentMethod === 'cash' && lastTransaction?.change ? lastTransaction.change : 0
  const shouldShowChange = changeAmount > 0 && (status === 'completing' || status === 'idle')

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto", className)}>
      {/* 음료 배출구 */}
      <Card className="bg-black/70 p-4">
        <div className="text-center">
          <div className="text-gray-300 text-sm mb-2">음료 배출구</div>
          <div className={cn(
            "h-20 bg-black rounded-lg border-2 border-gray-600",
            "flex items-center justify-center",
            "transition-all duration-500",
            isDispensing && "border-green-400 bg-green-900/20",
            isCompleting && "border-blue-400 bg-blue-900/20"
          )}>
            {isDispensing && (
              <div className="flex items-center gap-2 text-green-400">
                <div className="animate-spin h-4 w-4 border-2 border-green-400 border-t-transparent rounded-full" />
                <span className="text-sm">배출중...</span>
              </div>
            )}
            
            {isCompleting && (
              <div className="flex items-center gap-2 text-blue-400">
                <div className="animate-pulse h-4 w-4 bg-blue-400 rounded-full" />
                <span className="text-sm">완료중...</span>
              </div>
            )}
            
            {lastDispensedProduct && !isDispensing && !isCompleting && (
              <div className="text-center animate-bounce">
                <div className="text-2xl mb-1">
                  {PRODUCT_IMAGES[lastDispensedProduct]}
                </div>
                <div className="text-xs text-green-400">배출 완료</div>
              </div>
            )}
            
            {!isDispensing && !isCompleting && !lastDispensedProduct && (
              <div className="text-gray-500 text-sm">배출구</div>
            )}
          </div>
        </div>
      </Card>

      {/* 거스름돈 반환구 */}
      <Card className="bg-black/70 p-4">
        <div className="text-center">
          <div className="text-gray-300 text-sm mb-2">거스름돈 반환구</div>
          <div className={cn(
            "h-20 bg-black rounded-lg border-2 border-gray-600",
            "flex items-center justify-center",
            "transition-all duration-500",
            shouldShowChange && "border-yellow-400 bg-yellow-900/20"
          )}>
            {shouldShowChange ? (
              <div className="text-center animate-pulse">
                <div className="text-yellow-400 font-bold">
                  {changeAmount.toLocaleString()}원
                </div>
                <div className="text-xs text-yellow-400">거스름돈</div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">거스름돈 반환구</div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}