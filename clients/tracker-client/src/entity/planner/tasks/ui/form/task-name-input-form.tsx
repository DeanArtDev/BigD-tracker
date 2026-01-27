import { InputForm } from '@/shared/components/form';
import { Button } from '@/shared/ui-kit/ui/button';
import { Check, XIcon } from 'lucide-react';

interface TaskNameInputFormProps {
  readonly renderControls?: boolean;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly onOk: () => void;
  readonly onCancel: () => void;
}

function TaskNameInputForm({
  renderControls,
  placeholder,
  disabled,
  onOk,
  onCancel,
}: TaskNameInputFormProps) {
  return (
    <div className="flex w-full items-center gap-1">
      <InputForm autoFocus className="grow font-normal" name="name" placeholder={placeholder} />

      {renderControls && (
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

export { TaskNameInputForm };
