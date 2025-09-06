import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, X, RefreshCw } from "lucide-react";

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorType: string;
  title: string;
  message: string;
  onRetry?: () => void;
  canRetry?: boolean;
}

const ERROR_CONFIGS = {
  insufficient_funds: {
    icon: "",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  out_of_stock: {
    icon: "",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  change_shortage: {
    icon: "",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  fake_money: {
    icon: "🚫",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  card_error: {
    icon: "",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  network_error: {
    icon: "",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  system_maintenance: {
    icon: "",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
  default: {
    icon: "",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
};

export function ErrorDialog({
  open,
  onOpenChange,
  errorType,
  title,
  message,
  onRetry,
  canRetry = false,
}: ErrorDialogProps) {
  const config =
    ERROR_CONFIGS[errorType as keyof typeof ERROR_CONFIGS] ||
    ERROR_CONFIGS.default;

  const getActionMessage = () => {
    switch (errorType) {
      case "insufficient_funds":
        return "현금을 더 투입하거나 다른 음료를 선택해주세요.";
      case "out_of_stock":
        return "다른 음료를 선택해주세요.";
      case "change_shortage":
        return "정확한 금액을 투입하거나 카드로 결제해주세요.";
      case "fake_money":
        return "투입하신 화폐를 확인하고 다시 시도해주세요.";
      case "card_error":
        return "카드를 다시 삽입하거나 현금으로 결제해주세요.";
      case "network_error":
        return "현금 결제를 이용하거나 잠시 후 다시 시도해주세요.";
      case "system_maintenance":
        return "시스템 점검 중입니다. 잠시 후 다시 이용해주세요.";
      default:
        return "잠시 후 다시 시도해주세요.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md ${config.borderColor}`}>
        <DialogHeader className="text-center">
          <DialogTitle className={`text-lg ${config.color}`}>
            {title}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Alert className={`${config.borderColor} ${config.bgColor}`}>
            <AlertTriangle className={`h-4 w-4 ${config.color}`} />
            <AlertDescription className={config.color}>
              <strong>해결 방법:</strong>
              <br />
              {getActionMessage()}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            <X className="h-4 w-4 mr-1" />
            닫기
          </Button>
          {canRetry && onRetry && (
            <Button
              onClick={() => {
                onRetry();
                onOpenChange(false);
              }}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              다시 시도
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
