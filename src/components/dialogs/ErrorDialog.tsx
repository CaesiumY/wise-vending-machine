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
import { X, RefreshCw } from "lucide-react";

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorType: string;
  title: string;
  message: string;
  onRetry?: () => void;
  canRetry?: boolean;
}

export function ErrorDialog({
  open,
  onOpenChange,
  errorType,
  title,
  message,
  onRetry,
  canRetry = false,
}: ErrorDialogProps) {
  const getActionMessage = () => {
    switch (errorType) {
      case "insufficient_funds":
        return "현금을 더 투입하거나 다른 음료를 선택해주세요.";
      case "out_of_stock":
        return "다른 음료를 선택해주세요.";
      case "change_shortage":
        return "정확한 금액을 투입하거나 카드로 결제해주세요.";
      // (삭제) 위조화폐 시나리오 제거
      case "card_error":
        return "카드를 다시 삽입하거나 현금으로 결제해주세요.";
      // (삭제) 네트워크 오류 시나리오 제거
      case "system_maintenance":
        return "시스템 점검 중입니다. 잠시 후 다시 이용해주세요.";
      default:
        return "잠시 후 다시 시도해주세요.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md`}>
        <DialogHeader className="text-center">
          <DialogTitle className={`text-lg`}>{title}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Alert>
            <AlertDescription>
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
