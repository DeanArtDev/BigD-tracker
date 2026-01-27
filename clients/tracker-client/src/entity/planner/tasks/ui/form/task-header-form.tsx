import { Button } from '@/shared/ui-kit/ui/button';
import { NotebookPen } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import { TaskNameInputForm } from './task-name-input-form';

interface TaskHeaderFormProps {
  readonly beforeNameSlot?: ReactNode;
  readonly afterNameSlot?: ReactNode;
  readonly mode?: 'edit' | 'create';
  readonly onOk?: () => void;
  readonly onCancel?: () => void;
}

interface FormFieldsUsed {
  readonly name?: string;
}

function TaskHeaderForm({
  beforeNameSlot,
  afterNameSlot,
  mode = 'create',
  onOk,
  onCancel,
}: TaskHeaderFormProps) {
  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';

  const [editName, setEditName] = useState(isCreate);
  const name = useWatch<FormFieldsUsed>({ name: 'name' });
  const placeholder = 'Задайте имя';
  const { disabled } = useFormState();

  return (
    <div className="flex grow gap-2 text-center sm:text-left w-full mb-0 border-b justify-between p-2.5 pb-2 sm:p-4">
      {beforeNameSlot}

      {editName ? (
        <TaskNameInputForm
          renderControls={isEdit}
          disabled={disabled}
          placeholder={placeholder}
          onOk={() => {
            setEditName(false);
            onOk?.();
          }}
          onCancel={() => {
            setEditName(false);
            onCancel?.();
          }}
        />
      ) : (
        <div className="inline-flex items-center gap-2">
          <h2 className="flex items-center text-lg leading-none font-semibold wrap-break-word break-all">
            {name ?? placeholder}
          </h2>

          <Button
            className="size-4 mt-1.5 sm:mt-1 mb-auto"
            type="button"
            size="icon"
            disabled={disabled}
            variant="ghost"
            onClick={() => void setEditName(true)}
          >
            <NotebookPen className="size-4" color="var(--color-gray-500)" />
          </Button>
        </div>
      )}

      {(!editName || isCreate) && afterNameSlot}
    </div>
  );
}

export { TaskHeaderForm };
