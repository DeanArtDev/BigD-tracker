import { InputForm } from '@/shared/components/form';
import { Button } from '@/shared/ui-kit/ui/button';
import { cn } from '@/shared/ui-kit/utils';
import { Check, XIcon } from 'lucide-react';
import type { FieldValues, Path } from 'react-hook-form';

interface ControlledInputFormProps<FormValues extends FieldValues> {
  readonly name: Path<FormValues>;
  readonly showControls?: boolean;
  readonly placeholder?: string;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly onOk: () => void;
  readonly onCancel: () => void;
}

function ControlledInputForm<FormValues extends FieldValues = FieldValues>({
  showControls,
  placeholder,
  disabled,
  name,
  className,
  onOk,
  onCancel,
}: ControlledInputFormProps<FormValues>) {
  return (
    <div className={cn('flex w-full items-center gap-1', className)}>
      <InputForm
        autoFocus
        classNames={{ input: 'grow font-normal', wrapper: 'grow' }}
        name={name}
        placeholder={placeholder}
      />

      {showControls && (
        <>
          <Button
            className="mb-auto mt-0.5"
            type="button"
            variant="ghost"
            aria-label="Отмена"
            size="sm"
            disabled={disabled}
            onClick={onCancel}
          >
            <XIcon />
          </Button>

          <Button
            className="mb-auto mt-0.5"
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Сохранение"
            disabled={disabled}
            onClick={onOk}
          >
            <Check />
          </Button>
        </>
      )}
    </div>
  );
}

export { ControlledInputForm };
