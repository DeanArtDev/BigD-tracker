import { cn } from '@/shared/ui-kit/utils';
import type { JSX } from 'react';
import { type FieldValues, type Path, useFormContext } from 'react-hook-form';

interface ErrorMessageFormProps<FormValues extends FieldValues = FieldValues> {
  readonly name: Path<FormValues>;
  readonly className?: string;
  readonly renderContent?: (params: { name: Path<FormValues>; message: string }) => JSX.Element;
}

function ErrorMessageForm<FormValues extends FieldValues = FieldValues>({
  name,
  className,
  renderContent,
}: ErrorMessageFormProps<FormValues>) {
  const context = useFormContext<FormValues>();

  const message = context.getFieldState(name).error?.message;
  const hasMessage = !!context.formState.errors[name]?.message;

  if (!hasMessage || message == null) return null;
  if (renderContent != null) return renderContent({ name, message });
  return (
    <p data-slot="error-message-form" className={cn('text-destructive text-sm', className)}>
      {message}
    </p>
  );
}

export { ErrorMessageForm, type ErrorMessageFormProps };
