'use client';

import { isEmpty } from 'lodash-es';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { TaskFormData } from '../task-form';

function TaskFormErrorReactor() {
  const { subscribe } = useFormContext<TaskFormData>();

  useEffect(() => {
    const toastIds = new Map<string, string | number>();

    const unsubscribe = subscribe({
      formState: { errors: true },
      callback: (data) => {
        const errors = Array.from(Object.values(data.errors ?? {})).filter((e) => e.message != null);

        for (const error of errors) {
          if (!isEmpty(error)) {
            if (toastIds.get(error.message ?? '') != null) return;

            const currentId = toast.warning(error.message, {
              duration: 10000,
              onAutoClose: () => {
                const exist = toastIds.get(error.message ?? '');
                toast.dismiss(exist);
                toastIds.delete(error.message ?? '');
              },

              onDismiss: () => {
                const exist = toastIds.get(error.message ?? '');
                toast.dismiss(exist);
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
        toast.dismiss(+toastId);
      });
      toastIds.clear();
      unsubscribe();
    };
  }, [subscribe]);

  return null;
}

export { TaskFormErrorReactor };
