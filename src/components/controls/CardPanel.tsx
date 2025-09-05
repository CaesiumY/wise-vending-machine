import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useVendingStore } from '@/stores/vendingStore'
import { useState } from 'react'

interface CardPanelProps {
  className?: string
}

export function CardPanel({ className }: CardPanelProps) {
  const { 
    selectedProduct, 
    products, 
    status, 
    paymentMethod, 
    processCardPayment,
    cancelTransaction 
  } = useVendingStore()

  const [cardNumber, setCardNumber] = useState('')
  const [isCardInserted, setIsCardInserted] = useState(false)

  // 카드 패널 표시 여부
  const isVisible = paymentMethod === 'card'
  const isProcessing = status === 'card_process'
  const isDisabled = status === 'dispensing' || status === 'completing' || status === 'maintenance'

  // 선택된 상품 정보
  const selectedProductInfo = selectedProduct ? products[selectedProduct] : null
  const selectedAmount = selectedProductInfo?.price || 0

  // 카드 삽입 시뮬레이터
  const handleCardInsert = () => {
    if (!cardNumber || selectedAmount === 0) return
    
    setIsCardInserted(true)
    // 카드 인식 시뮬레이션 (1초 후)
    setTimeout(() => {
      if (selectedAmount > 0) {
        processCardPayment(selectedAmount)
      }
    }, 1000)
  }

  // 취소 핸들러
  const handleCancel = () => {
    setIsCardInserted(false)
    setCardNumber('')
    cancelTransaction()
  }

  // 카드번호 입력 포맷팅
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // 숫자만 추출
    const formatted = value.replace(/(.{4})/g, '$1-').replace(/-$/, '') // 4자리마다 하이픈
    if (formatted.length <= 19) { // 최대 16자리 + 3개 하이픈
      setCardNumber(formatted)
    }
  }

  // 컴포넌트가 보이지 않는 경우
  if (!isVisible) return null

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="text-center">
          <h3 className="text-lg font-semibold">💳 카드 결제</h3>
          <p className="text-sm text-gray-600">카드를 삽입해주세요</p>
        </div>

        {/* 카드 삽입 시뮬레이터 */}
        <div className={cn(
          "border-2 border-dashed border-gray-300 rounded-lg p-4",
          "transition-all duration-300",
          isCardInserted && "border-blue-500 bg-blue-50"
        )}>
          {!isCardInserted ? (
            <div className="text-center">
              <div className="text-6xl mb-2">💳</div>
              <p className="text-sm text-gray-600 mb-3">카드 투입구</p>
              
              {/* 카드 번호 입력 (시뮬레이션용) */}
              <div className="space-y-2 mb-3">
                <Label htmlFor="cardNumber" className="text-xs">
                  카드 번호 (시뮬레이션용)
                </Label>
                <Input
                  id="cardNumber"
                  placeholder="1234-5678-9012-3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="text-center"
                  disabled={isDisabled}
                />
              </div>

              <Button
                onClick={handleCardInsert}
                disabled={isDisabled || !cardNumber || selectedAmount === 0}
                className="w-full"
              >
                카드 인식
              </Button>

              {selectedAmount === 0 && (
                <p className="text-xs text-orange-600 mt-2">
                  음료를 먼저 선택해주세요
                </p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-2">✅</div>
              <p className="text-sm text-green-600 mb-2">카드가 인식되었습니다</p>
              
              {/* 결제 정보 */}
              <div className="bg-white border rounded p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">결제금액</span>
                  <span className="font-bold">
                    {selectedAmount.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">상품명</span>
                  <span className="text-sm font-medium">
                    {selectedProductInfo?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">카드번호</span>
                  <span className="text-sm">****-****-****-{cardNumber.slice(-4)}</span>
                </div>
              </div>

              {/* 결제 진행 상태 */}
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                  <span className="text-sm">결제 진행중...</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => processCardPayment(selectedAmount)}
                    disabled={isDisabled}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    결제 진행
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isDisabled}
                    className="flex-1"
                  >
                    취소
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 결제 안내 */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>💡 음료 선택 후 카드로 결제가 가능합니다</p>
          <p>⚡ 네트워크 상태에 따라 결제시간이 달라질 수 있습니다</p>
        </div>

        {/* 상태 표시 */}
        {status === 'card_process' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              <div className="animate-spin h-3 w-3 border border-blue-700 border-t-transparent rounded-full" />
              결제 처리 중
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}