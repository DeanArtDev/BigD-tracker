import { AlertConfirmDialog } from '@/shared/components/alert-confirm-dialog';
import { type ReactElement, useState } from 'react';

function useConfirmDialog() {
  const [confirmProps, setConfirmProps] = useState<null | {
    title: string;
    content?: string;
    onConfirm: () => void;
    onDecline?: () => void;
  }>(null);

  const confirmHolder: ReactElement | null =
    confirmProps != null ? (
      <AlertConfirmDialog
        open
        title={confirmProps.title}
        onOpenChange={(value) => {
          !value && setConfirmProps(null);
        }}
        onConfirm={confirmProps.onConfirm}
        onDecline={confirmProps.onDecline}
      />
    ) : null;

  const viaConfirmation = (param: {
    isNeedConfirm: () => boolean;
    callback: () => void;
    cancel?: () => void;
    dialog?: {
      title: string;
      content?: string;
    };
  }) => {
    param.isNeedConfirm()
      ? setConfirmProps({
          title: param.dialog?.title ?? 'Не сохраненные данные будут потеряны! Закрыть?',
          content: param.dialog?.content,
          onConfirm: param.callback,
          onDecline: param?.cancel,
        })
      : param.callback();
  };

  return {
    confirmHolder,
    viaConfirmation,
  };
}

export { useConfirmDialog };
