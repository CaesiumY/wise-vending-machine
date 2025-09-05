import { PaymentSelector } from './PaymentSelector'
import { CashPanel } from './CashPanel'
import { CardPanel } from './CardPanel'
import { ControlStatus } from './ControlStatus'

interface ControlPanelProps {
  className?: string
}

export function ControlPanel({ className }: ControlPanelProps) {
  return (
    <div className={className}>
      <div className="space-y-4">
        {/* 결제 방식 선택 */}
        <PaymentSelector />
        
        {/* 현재 상태 표시 */}
        <ControlStatus />
        
        {/* 현금 투입 패널 */}
        <CashPanel />
        
        {/* 카드 결제 패널 */}
        <CardPanel />
      </div>
    </div>
  )
}