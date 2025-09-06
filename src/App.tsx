import { AdminPanel } from "@/components/admin/AdminPanel";
import { CashPanel } from "@/components/controls/CashPanel";
import { CardPanel } from "@/components/controls/CardPanel";
import { PaymentSelector } from "@/components/controls/PaymentSelector";
import { ProductDisplay } from "@/components/display/ProductDisplay";
import { StatusDisplay } from "@/components/display/StatusDisplay";
import { MainLayout, VendingLayout } from "@/components/layout/MainLayout";
import { Toaster } from "@/components/ui/sonner";
import { useVendingStore } from "@/stores/vendingStore";

function App() {
  const { paymentMethod } = useVendingStore();
  return (
    <MainLayout>
      <VendingLayout
        vendingDisplay={
          <div className="flex flex-col h-full">
            {/* 상태 표시 */}
            <StatusDisplay />

            {/* 음료 선택 영역 */}
            <div className="flex-1 flex items-center justify-center">
              <ProductDisplay />
            </div>
          </div>
        }
        controlPanel={
          <div className="flex flex-col h-full gap-4">
            {/* 결제 방식 선택 */}
            <PaymentSelector />

            {/* 결제 패널 */}
            <div className="flex-1">
              {paymentMethod === "cash" && <CashPanel />}
              {paymentMethod === "card" && <CardPanel />}
            </div>

            {/* 관리자 패널 */}
            <AdminPanel />
          </div>
        }
      />
      <Toaster />
    </MainLayout>
  );
}

export default App;
