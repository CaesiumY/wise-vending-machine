import { MainLayout, VendingLayout } from "@/components/layout/MainLayout";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { ProductDisplay } from "@/components/display/ProductDisplay";
import { StatusDisplay } from "@/components/display/StatusDisplay";
import { DispenseArea } from "@/components/display/DispenseArea";
import { PaymentSelector } from "@/components/controls/PaymentSelector";
import { CashPanel } from "@/components/controls/CashPanel";
import { Button } from "./components/ui/button";
import { Switch } from "./components/ui/switch";
import { Label } from "./components/ui/label";

function App() {
  return (
    <MainLayout>
      <Button>test</Button>
      <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" />
        <Label htmlFor="airplane-mode">Airplane Mode</Label>
      </div>

      <VendingLayout
        vendingDisplay={
          <div className="flex flex-col h-full">
            {/* 상태 표시 */}
            <StatusDisplay />

            {/* 음료 선택 영역 */}
            <div className="flex-1 flex items-center justify-center">
              <ProductDisplay />
            </div>

            {/* 배출구 영역 */}
            <DispenseArea />
          </div>
        }
        controlPanel={
          <div className="flex flex-col h-full gap-4">
            {/* 결제 방식 선택 */}
            <PaymentSelector />

            {/* 현금 패널 */}
            <div className="flex-1">
              <CashPanel />
            </div>

            {/* 관리자 패널 */}
            <AdminPanel />
          </div>
        }
      />
    </MainLayout>
  );
}

export default App;
