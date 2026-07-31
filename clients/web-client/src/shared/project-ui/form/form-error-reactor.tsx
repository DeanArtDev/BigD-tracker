'use client';

import { isEmpty } from 'lodash-es';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNotify } from '@/shared/project-ui';

function FormErrorReactor() {
  const { subscribe } = useFormContext();
  const { dismiss, warning } = useNotify();

  useEffect(() => {
    const toastIds = new Map<string, string | number>();

    const unsubscribe = subscribe({
      formState: { errors: true },
      callback: (data) => {
        const errors = Array.from(Object.values(data.errors ?? {}));

        for (const error of errors) {
          if (!isEmpty(error) && isErrorWithMessage(error)) {
            if (toastIds.get(error.message ?? '') != null) return;

            const currentId = warning({
              message: error.message,
              duration: 10000,
              position: 'top-center',
              onAutoClose: () => {
                const exist = toastIds.get(error.message ?? '');
                dismiss(exist);
                toastIds.delete(error.message ?? '');
              },

              onDismiss: () => {
                const exist = toastIds.get(error.message ?? '');
                dismiss(exist);
                toastIds.delete(error.message ?? '');
              },
            });
            toastIds.set(error.message ?? '', currentId);
          }
        }
      },
    });

    return () => {
      toastIds.entries().forEach(([, toastId]) => {
        dismiss(+toastId);
      });
      toastIds.clear();
      unsubscribe();
    };
  }, [dismiss, subscribe, warning]);

  return null;
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return typeof error === 'object' && error != null && 'message' in error;
}

export { FormErrorReactor };
