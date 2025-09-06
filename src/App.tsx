import { AdminPanel } from "@/components/admin/AdminPanel";
import { PaymentSelector } from "@/components/controls/PaymentSelector";
import { ProductDisplay } from "@/components/display/ProductDisplay";
import { StatusDisplay } from "@/components/display/StatusDisplay";
import { VendingMachine } from "@/components/layout/VendingMachine";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
      <VendingMachine>
        <VendingMachine.Display>
          <div className="flex flex-col h-full">
            {/* 상태 표시 */}
            <StatusDisplay />

            {/* 음료 선택 영역 */}
            <div className="flex-1 flex items-center justify-center">
              <ProductDisplay />
            </div>
          </div>
        </VendingMachine.Display>
        
        <VendingMachine.Controls>
          {/* 결제 방식 선택 */}
          <PaymentSelector />

          {/* 결제 패널 - 동적으로 현금/카드 패널 전환 */}
          <VendingMachine.PaymentPanel />

          {/* 관리자 패널 */}
          <AdminPanel />
        </VendingMachine.Controls>
      </VendingMachine>
      
      <Toaster />
    </>
  );
}

export default App;
