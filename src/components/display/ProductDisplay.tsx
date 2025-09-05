import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useVendingStore } from '@/stores/vendingStore'
import { useAdminStore } from '@/stores/adminStore'
import type { ProductType } from '@/types'
import { PRODUCT_IMAGES } from '@/constants/products'

interface ProductDisplayProps {
  className?: string
}

export function ProductDisplay({ className }: ProductDisplayProps) {
  // 자판기 상태
  const { 
    products, 
    currentBalance, 
    selectedProduct, 
    paymentMethod,
    status,
    selectProduct 
  } = useVendingStore()

  // 관리자 설정
  const { stockLevels } = useAdminStore()

  // 버튼 상태 결정 함수
  const getButtonState = (productId: ProductType) => {
    const product = products[productId]
    const adminStock = stockLevels[productId]
    
    // 재고 확인 (관리자 설정 우선)
    if (product.stock <= 0 || adminStock <= 0) return 'out-of-stock'
    
    // 선택된 상태
    if (selectedProduct === productId) return 'selected'
    
    // 현금 결제시 잔액 확인
    if (paymentMethod === 'cash' && currentBalance < product.price) {
      return 'insufficient-funds'
    }
    
    // 음료 선택 가능한 상태인지 확인
    if (status === 'product_select' || status === 'card_process') {
      return 'available'
    }
    
    return 'disabled'
  }

  // 버튼 스타일 반환 함수
  const getButtonStyle = (state: string) => {
    const baseClasses = "h-32 w-full flex flex-col items-center justify-center gap-2 transition-all duration-300 ease-in-out"
    
    switch (state) {
      case 'out-of-stock':
        return cn(baseClasses, 'bg-red-500 hover:bg-red-600 text-white opacity-50 cursor-not-allowed')
      case 'insufficient-funds':
        return cn(baseClasses, 'bg-orange-400 hover:bg-orange-500 text-white opacity-75 cursor-not-allowed')
      case 'selected':
        return cn(baseClasses, 'bg-green-500 hover:bg-green-600 text-white ring-2 ring-green-300')
      case 'available':
        return cn(baseClasses, 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105')
      case 'disabled':
      default:
        return cn(baseClasses, 'bg-gray-400 text-gray-600 cursor-not-allowed')
    }
  }

  // 음료 선택 핸들러
  const handleProductSelect = (productId: ProductType) => {
    const buttonState = getButtonState(productId)
    
    // 선택 불가능한 상태면 무시
    if (buttonState === 'out-of-stock' || 
        buttonState === 'insufficient-funds' || 
        buttonState === 'disabled') {
      return
    }
    
    selectProduct(productId)
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-4", className)}>
      {Object.entries(products).map(([productId, product]) => {
        const buttonState = getButtonState(productId as ProductType)
        const adminStock = stockLevels[productId as ProductType]
        const isDisabled = buttonState === 'out-of-stock' || 
                          buttonState === 'insufficient-funds' ||
                          buttonState === 'disabled'
        
        return (
          <div key={productId} className="relative">
            <Button
              className={getButtonStyle(buttonState)}
              disabled={isDisabled}
              onClick={() => handleProductSelect(productId as ProductType)}
            >
              {/* 음료 아이콘 */}
              <div className="text-3xl">
                {PRODUCT_IMAGES[productId as ProductType]}
              </div>
              
              {/* 음료 이름 */}
              <span className="font-bold text-lg">{product.name}</span>
              
              {/* 가격 */}
              <span className="text-sm">{product.price.toLocaleString()}원</span>
              
              {/* 상태 표시 */}
              <div className="flex gap-1 flex-wrap justify-center">
                {buttonState === 'out-of-stock' && (
                  <Badge variant="destructive" className="text-xs">품절</Badge>
                )}
                {buttonState === 'insufficient-funds' && (
                  <Badge variant="secondary" className="text-xs">금액부족</Badge>
                )}
                {buttonState === 'selected' && (
                  <Badge variant="default" className="text-xs bg-green-600">선택됨</Badge>
                )}
                {/* 재고 표시 (재고가 적을 때만) */}
                {adminStock > 0 && adminStock <= 2 && buttonState !== 'out-of-stock' && (
                  <Badge variant="outline" className="text-xs">
                    재고 {adminStock}
                  </Badge>
                )}
              </div>
            </Button>
          </div>
        )
      })}
    </div>
  )
}