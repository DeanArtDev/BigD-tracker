import type { FormStateEmitterProps } from '@/shared/components/form';
import { useState } from 'react';

function useFormStateEmitter() {
  const [formEmitterState, setFormEmitterState] = useState({ isDirty: false, isLoading: false });

  return {
    formEmitterState,
    formStateEmitterProps: {
      emitIsDirty: (v: boolean) => void setFormEmitterState((prev) => ({ ...prev, isDirty: v })),
      emitIsLoading: (v: boolean) =>
        void setFormEmitterState((prev) => ({ ...prev, isLoading: v })),
    } satisfies Omit<FormStateEmitterProps, 'isLoading'>,
  };
}

export { useFormStateEmitter };
