import type { ReactNode } from "react";
import { cn } from "@/shared/utils/ui";
import { useVendingStore } from "@/features/machine/store/vendingStore";
import { CashPanel } from "@/features/payment/components/CashPanel";
import { CardPanel } from "@/features/payment/components/CardPanel";
import { MainLayout } from "@/shared/components/layout/MainLayout";

interface VendingMachineProps {
  children: ReactNode;
  className?: string;
}

interface VendingDisplayProps {
  children: ReactNode;
  className?: string;
}

interface VendingControlsProps {
  children: ReactNode;
  className?: string;
}

/**
 * VendingMachine - 자판기 메인 컨테이너 (Compound Component Pattern)
 * 
 * Usage:
 * <VendingMachine>
 *   <VendingMachine.Display>
 *     <StatusDisplay />
 *     <ProductDisplay />
 *   </VendingMachine.Display>
 *   
 *   <VendingMachine.Controls>
 *     <PaymentSelector />
 *     <VendingMachine.PaymentPanel />
 *     <AdminPanel />
 *   </VendingMachine.Controls>
 * </VendingMachine>
 */
function VendingMachine({ children, className }: VendingMachineProps) {
  return (
    <MainLayout>
      <div
        className={cn(
          // 메인 패널 - 2분할 그리드
          "grid grid-cols-2 min-h-[600px]",
          className
        )}
      >
        {children}
      </div>
    </MainLayout>
  );
}

/**
 * VendingMachine.Display - 자판기 디스플레이 영역
 * 상태 표시, 상품 진열 등의 시각적 요소를 포함
 */
function VendingDisplay({ children, className }: VendingDisplayProps) {
  return (
    <div
      className={cn(
        // 자판기 디스플레이 영역
        "bg-muted",
        "p-6",
        "border-r border-border",
        "flex flex-col justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * VendingMachine.Controls - 컨트롤 패널 영역
 * 결제 방식 선택, 관리자 패널 등의 인터랙션 요소를 포함
 */
function VendingControls({ children, className }: VendingControlsProps) {
  return (
    <div
      className={cn(
        // 컨트롤 패널 영역
        "bg-background",
        "p-6",
        "flex flex-col gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * VendingMachine.PaymentPanel - 결제 방식에 따른 동적 패널
 * 현재 선택된 결제 방식(현금/카드)에 따라 적절한 패널을 표시
 */
function VendingPaymentPanel() {
  const { paymentMethod } = useVendingStore();
  
  return (
    <div className="flex-1">
      {paymentMethod === "cash" && <CashPanel />}
      {paymentMethod === "card" && <CardPanel />}
    </div>
  );
}

// Compound Component 패턴으로 서브 컴포넌트들을 메인 컴포넌트에 연결
VendingMachine.Display = VendingDisplay;
VendingMachine.Controls = VendingControls;
VendingMachine.PaymentPanel = VendingPaymentPanel;

export {
  VendingMachine,
  VendingDisplay,
  VendingControls,
  VendingPaymentPanel,
};