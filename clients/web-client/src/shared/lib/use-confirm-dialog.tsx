'use client';

import { type ReactElement, type ReactNode, useState } from 'react';
import { AlertConfirmDialog } from '@/shared/project-ui';

function useConfirmDialog() {
  const [confirmProps, setConfirmProps] = useState<null | {
    title: ReactNode;
    content?: ReactNode;
    onConfirm: () => void;
    onDecline?: () => void;
  }>(null);

  const confirmHolder: ReactElement | null =
    confirmProps != null ? (
      <AlertConfirmDialog
        open
        title={confirmProps.title}
        content={confirmProps.content}
        onOpenChange={(value) => {
          if (!value) setConfirmProps(null);
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
      title?: string;
      content?: string;
    };
  }) => {
    if (param.isNeedConfirm()) {
      setConfirmProps({
        title: param.dialog?.title ?? null,
        content: param.dialog?.content ?? null,
        onConfirm: param.callback,
        onDecline: param?.cancel,
      });
    } else {
      param.callback();
    }
  };

  return {
    confirmHolder,
    viaConfirmation,
  };
}

export { useConfirmDialog };
