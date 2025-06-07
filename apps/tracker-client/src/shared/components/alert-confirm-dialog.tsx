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
} from '@/shared/ui-kit/ui/alert-dialog';
import type { PropsWithChildren, ReactNode } from 'react';

interface AlertConfirmDialogProps {
  readonly title: string;
  readonly content?: ReactNode;
  readonly onConfirm: () => void;
  readonly onDecline?: () => void;
}

function AlertConfirmDialog({
  title,
  content,
  children,
  onConfirm,
  onDecline,
}: PropsWithChildren<AlertConfirmDialogProps>) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription>{content}</AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDecline}>Нет</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Да</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { AlertConfirmDialog, type AlertConfirmDialogProps };
