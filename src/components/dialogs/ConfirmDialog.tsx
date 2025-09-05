import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  onConfirm: () => void;
  onCancel?: () => void;
}

const VARIANT_CONFIGS = {
  default: {
    icon: '❓',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    confirmButton: 'bg-blue-500 hover:bg-blue-600',
  },
  destructive: {
    icon: '⚠️',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    confirmButton: 'bg-red-500 hover:bg-red-600',
  },
  warning: {
    icon: '🚨',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    confirmButton: 'bg-orange-500 hover:bg-orange-600',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'default',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const config = VARIANT_CONFIGS[variant];

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={cn(
              "text-4xl p-3 rounded-full",
              config.bgColor
            )}>
              {config.icon}
            </div>
          </div>
          <DialogTitle className={cn("text-lg", config.color)}>
            {title}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={cn("flex-1", config.confirmButton)}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}