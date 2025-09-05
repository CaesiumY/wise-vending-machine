import { MainLayout, VendingLayout } from '@/components/layout/MainLayout';
import { AdminPanel } from '@/components/admin/AdminPanel';

// 임시 더미 컴포넌트들 (Phase 3의 다른 Task에서 구현 예정)
const ProductDisplay = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 w-full">
    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center transition-colors shadow-lg border border-blue-500">
      <div className="font-bold text-lg">콜라</div>
      <div className="text-sm text-blue-100">1,100원</div>
    </button>
    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center transition-colors shadow-lg border border-blue-500">
      <div className="font-bold text-lg">물</div>
      <div className="text-sm text-blue-100">600원</div>
    </button>
    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center transition-colors shadow-lg border border-blue-500">
      <div className="font-bold text-lg">커피</div>
      <div className="text-sm text-blue-100">700원</div>
    </button>
  </div>
);

const StatusDisplay = () => (
  <div className="bg-blue-900/50 text-white p-4 rounded-lg text-center mx-4 mt-4 border border-blue-600">
    <div className="text-xl font-bold mb-2">💰 투입금액: 0원</div>
    <div className="text-sm text-blue-200">음료를 선택해주세요</div>
  </div>
);

const DispenseArea = () => (
  <div className="bg-blue-950 text-white p-4 rounded-lg text-center border-2 border-blue-600 mx-4 mb-4">
    <div className="text-sm text-blue-200 mb-2">🥤 음료 배출구</div>
    <div className="h-16 bg-black/50 rounded border-2 border-dashed border-blue-400 flex items-center justify-center">
      <span className="text-xs text-blue-300">배출 대기중</span>
    </div>
    <div className="mt-2 text-xs text-blue-300">💰 거스름돈 반환구</div>
  </div>
);

const PaymentSelector = () => (
  <div className="flex gap-3 mb-4">
    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors shadow-md border border-blue-500 font-semibold">
      💵 현금 결제
    </button>
    <button className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 px-4 rounded-lg transition-colors shadow-md border border-gray-300 font-semibold">
      💳 카드 결제
    </button>
  </div>
);

const CashPanel = () => (
  <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
    <h3 className="font-bold mb-3 text-gray-800 text-center">💰 현금 투입</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
      {[100, 500, 1000, 5000, 10000].map(amount => (
        <button 
          key={amount}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md text-sm transition-colors shadow-sm border border-green-500"
        >
          {amount.toLocaleString()}원
        </button>
      ))}
    </div>
    <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition-colors shadow-md font-semibold">
      🔄 반환
    </button>
  </div>
);

const CardPanel = () => (
  <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hidden">
    <h3 className="font-bold mb-3 text-gray-800 text-center">💳 카드 결제</h3>
    <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-6 rounded-lg text-center text-gray-600">
      카드를 삽입해주세요
    </div>
  </div>
);


function App() {
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
            
            {/* 배출구 영역 */}
            <DispenseArea />
          </div>
        }
        controlPanel={
          <div className="flex flex-col h-full">
            {/* 결제 방식 선택 */}
            <PaymentSelector />
            
            {/* 현금/카드 패널 */}
            <div className="flex-1">
              <CashPanel />
              <CardPanel />
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
