import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

// Icons removed for minimal UI

export function NotificationDialog({
  open,
  onOpenChange,
  title,
  message,
  autoClose = true,
  autoCloseDelay = 3000,
}: NotificationDialogProps) {
  useEffect(() => {
    // 자동 닫힘 기능 비활성화
  }, [open, autoClose, autoCloseDelay, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("sm:max-w-sm")}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center pb-2">
          <DialogTitle className={cn("text-base")}>{title}</DialogTitle>
          <DialogDescription className="text-center">
            {message}
          </DialogDescription>
        </DialogHeader>

        {/* 미니멀 UI: 자동 닫힘 프로그레스 바 제거 */}
      </DialogContent>
    </Dialog>
  );
}
