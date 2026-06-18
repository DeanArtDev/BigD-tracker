'use client';

import { PropsWithChildren, ReactNode, useState } from 'react';
import { MaybePromise } from '@/shared/lib';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  ButtonLoading,
} from '@/shared/ui-kit';

interface AlertConfirmDialogProps {
  readonly open?: boolean;
  readonly title: ReactNode;
  readonly content?: ReactNode;
  readonly onConfirm: () => MaybePromise<void>;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onDecline?: () => void;
}

function AlertConfirmDialog({
  open,
  title,
  content,
  onConfirm,
  onDecline,
  onOpenChange,
}: PropsWithChildren<AlertConfirmDialogProps>) {
  const [_open, _setOpen] = useState(open);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    _setOpen(false);
    onOpenChange?.(false);
  };

  return (
    <AlertDialog
      open={_open}
      onOpenChange={(value) => {
        if (loading) return;
        if (!value) handleClose();
      }}
    >
      <AlertDialogContent className="gap-2 p-5" size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription>{content}</AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
            onClick={(evt) => {
              evt.stopPropagation();
              onDecline?.();
              handleClose();
            }}
          >
            Нет
          </AlertDialogCancel>

          <ButtonLoading
            loading={loading}
            onClick={async (evt) => {
              evt.stopPropagation();
              try {
                setLoading(true);
                await onConfirm?.();
                handleClose();
              } finally {
                setLoading(false);
              }
            }}
          >
            Да
          </ButtonLoading>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { AlertConfirmDialog, type AlertConfirmDialogProps };
