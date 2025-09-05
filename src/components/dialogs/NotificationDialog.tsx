import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const NOTIFICATION_CONFIGS = {
  info: {
    icon: 'ℹ️',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  success: {
    icon: '✅',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  warning: {
    icon: '⚠️',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  error: {
    icon: '❌',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

export function NotificationDialog({
  open,
  onOpenChange,
  type,
  title,
  message,
  autoClose = true,
  autoCloseDelay = 3000
}: NotificationDialogProps) {
  const config = NOTIFICATION_CONFIGS[type];

  useEffect(() => {
    if (open && autoClose) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [open, autoClose, autoCloseDelay, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "sm:max-w-sm",
          config.borderColor
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className={cn(
              "text-4xl p-2 rounded-full",
              config.bgColor
            )}>
              {config.icon}
            </div>
          </div>
          <DialogTitle className={cn("text-base", config.color)}>
            {title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {message}
          </DialogDescription>
        </DialogHeader>

        {/* 자동 닫힘 프로그레스 바 */}
        {autoClose && (
          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
            <div 
              className={cn(
                "h-1 rounded-full transition-all ease-linear",
                config.color.replace('text-', 'bg-')
              )}
              style={{
                width: '100%',
                animation: `progress-bar ${autoCloseDelay}ms linear`
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}