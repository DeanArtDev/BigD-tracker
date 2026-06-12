'use client';

import { isEmpty } from 'lodash-es';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { TaskFormData } from '../task-form';

function TaskFormErrorReactor() {
  const { subscribe } = useFormContext<TaskFormData>();

  useEffect(() => {
    return subscribe({
      formState: { errors: true },
      callback: (data) => {
        const err = Array.from(Object.values(data.errors ?? {})).find((e) => e.message != null);

        if (!isEmpty(err)) {
          toast.warning(err.message, {
            position: 'top-center',
            duration: 15000,
            closeButton: true,
          });
        }
      },
    });
  }, [subscribe]);

  return null;
}

export { TaskFormErrorReactor };
