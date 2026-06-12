import type { PropsWithChildren, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui-kit';

interface AlertConfirmDialogProps {
  readonly skip?: boolean;
  readonly open?: boolean;
  readonly title: ReactNode;
  readonly content?: ReactNode;
  readonly onConfirm: () => void;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onDecline?: () => void;
}

function AlertConfirmDialog({
  open,
  skip = false,
  title,
  content,
  children,
  onConfirm,
  onDecline,
  onOpenChange,
}: PropsWithChildren<AlertConfirmDialogProps>) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {skip ? (
        <AlertDialogAction asChild onClick={onConfirm}>
          {children}
        </AlertDialogAction>
      ) : (
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      )}

      <AlertDialogContent className="gap-2 p-5" size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription>{content}</AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={(evt) => {
              evt.stopPropagation();
              onDecline?.();
            }}
          >
            Нет
          </AlertDialogCancel>
          <AlertDialogAction
            autoFocus
            onClick={(evt) => {
              evt.stopPropagation();
              onConfirm?.();
            }}
          >
            Да
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { AlertConfirmDialog, type AlertConfirmDialogProps };
