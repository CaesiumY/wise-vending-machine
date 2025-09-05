import { MainLayout } from '@/components/layout/MainLayout'
import { VendingMachineDisplay } from '@/components/display/VendingMachineDisplay'
import { ControlPanel } from '@/components/controls/ControlPanel'

function App() {
  return (
    <MainLayout>
      <VendingMachineDisplay />
      <ControlPanel />
    </MainLayout>
  )
}

export default App
