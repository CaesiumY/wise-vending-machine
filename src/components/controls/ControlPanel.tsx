import { PaymentSelector } from "./PaymentSelector";
import { CashPanel } from "./CashPanel";
import { CardPanel } from "./CardPanel";
import { ControlStatus } from "./ControlStatus";

interface ControlPanelProps {
  className?: string;
}

export function ControlPanel({ className }: ControlPanelProps) {
  return (
    <div className={className}>
      <div className="space-y-4">
        <PaymentSelector />
        <ControlStatus />
        <CashPanel />
        <CardPanel />
      </div>
    </div>
  );
}
