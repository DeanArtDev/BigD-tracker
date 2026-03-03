import { Typography } from '@/shared/components/typography';
import { Button } from '@/shared/ui-kit/ui/button';
import { cn } from '@/shared/ui-kit/utils';
import { NotebookPen } from 'lucide-react';
import { type ReactNode } from 'react';
import { type FieldValues, type Path, useFormState, useWatch } from 'react-hook-form';
import { ControlledInputForm } from './controlled-input-form';

interface ReadableInputFormProps<FormValues extends FieldValues = FieldValues> {
  readonly name: Path<FormValues>;
  readonly mode?: 'read' | 'edit';
  readonly placeholder?: string;
  readonly className?: string;
  readonly showControls?: boolean;
  readonly beforeNameSlot?: ReactNode;
  readonly afterNameSlot?: ReactNode;
  readonly onOk?: () => void;
  readonly onCancel?: () => void;
  readonly onModeChange?: (mode: ReadableInputFormProps<FormValues>['mode']) => void;
}

function ReadableInputForm<FormValues extends FieldValues = FieldValues>(props: ReadableInputFormProps<FormValues>) {
  const {
    name,
    beforeNameSlot,
    afterNameSlot,
    placeholder,
    className,
    mode = 'read',
    showControls = true,
    onOk,
    onCancel,
    onModeChange,
  } = props;

  const isRead = mode === 'read';
  const isEdit = mode === 'edit';

  const fieldValue = useWatch<FormValues>({ name });
  const { disabled, errors } = useFormState();
  const isFieldValid = errors[name] == null;

  return (
    <div
      className={cn(
        'readable-input-form flex grow min-w-0 gap-2 text-center sm:text-left w-full mb-0 justify-between p-2.5 pb-2 sm:p-4',
        className,
      )}
    >
      {beforeNameSlot}

      <ControlledInputForm<FormValues>
        name={name}
        className={cn({ hidden: !isEdit })}
        showControls={showControls}
        disabled={disabled || !isFieldValid}
        placeholder={placeholder}
        onOk={() => void onOk?.()}
        onCancel={() => {
          onCancel?.();
          onModeChange?.('read');
        }}
      />

      {isRead && (
        <div className="inline-flex grow items-center gap-2 min-w-0">
          <Typography.H4 className="line-clamp-3">{fieldValue ?? placeholder}</Typography.H4>

          <Button
            className="size-5 mt-1.5 sm:mt-1 mb-auto"
            type="button"
            size="icon"
            disabled={disabled}
            variant="ghost"
            onClick={() => void onModeChange?.('edit')}
          >
            <NotebookPen className="size-4" color="var(--color-gray-500)" />
          </Button>
        </div>
      )}

      {afterNameSlot}
    </div>
  );
}

export { ReadableInputForm };
