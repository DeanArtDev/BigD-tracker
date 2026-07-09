'use client';

import { ReactNode, useCallback } from 'react';
import { MaybePromise } from '@/shared/lib';
import { AlertConfirmDialog } from '../alert-confirm-dialog';
import { useConfirmDialogContext } from './confirm-dialog.context';

function useConfirmDialog() {
  const { setContent } = useConfirmDialogContext();

  const viaConfirmation = useCallback(
    (param: {
      isNeedConfirm: () => boolean;
      callback: () => MaybePromise<void>;
      cancel?: () => void;
      dialog?: {
        title?: ReactNode;
        content?: ReactNode;
      };
    }) => {
      if (param.isNeedConfirm()) {
        setContent(
          <AlertConfirmDialog
            open
            title={param.dialog?.title}
            content={param.dialog?.content}
            onOpenChange={(value) => {
              if (!value) setContent(null);
            }}
            onConfirm={param.callback}
            onDecline={param?.cancel}
          />,
        );
      } else {
        param.callback();
      }
    },
    [setContent],
  );

  return {
    viaConfirmation,
  };
}

export { useConfirmDialog };
