import { useEffect, useRef } from 'react';
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

  const emitIsDirtyRef = useRef(emitIsDirty);
  emitIsDirtyRef.current = emitIsDirty;
  useEffect(() => {
    emitIsDirtyRef.current?.(isDirty);
  }, [isDirty]);

  const emitIsLoadingRef = useRef(emitIsLoading);
  emitIsLoadingRef.current = emitIsLoading;
  useEffect(() => {
    emitIsLoadingRef.current?.(isFormLoading || isLoading);
  }, [isLoading, isFormLoading]);

  return null;
}

export { FormStateEmitter, type FormStateEmitterProps };
