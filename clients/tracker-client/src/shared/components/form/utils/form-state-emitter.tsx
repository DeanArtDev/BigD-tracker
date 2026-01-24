import { useEffect, useEffectEvent } from 'react';
import { useFormState } from 'react-hook-form';

interface FormStateEmitterProps {
  readonly isLoading?: boolean;
  readonly emitIsLoading?: (value: boolean) => void;
  readonly emitIsDirty?: (value: boolean) => void;
}

function FormStateEmitter({
  isLoading = false,
  emitIsDirty,
  emitIsLoading,
}: FormStateEmitterProps) {
  const { isDirty, isLoading: isFormLoading } = useFormState();

  const emitIsDirtyRef = useEffectEvent((v: boolean) => emitIsDirty?.(v));
  useEffect(() => {
    emitIsDirtyRef(isDirty);
  }, [isDirty]);

  const emitIsLoadingRef = useEffectEvent((v: boolean) => emitIsLoading?.(v));
  useEffect(() => {
    emitIsLoadingRef(isFormLoading || isLoading);
  }, [isLoading, isFormLoading]);

  return null;
}

export { FormStateEmitter, type FormStateEmitterProps };
