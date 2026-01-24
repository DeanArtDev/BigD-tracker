import { useIsMobile } from '@/shared/ui-kit/helpers';
import { Button } from '@/shared/ui-kit/ui/button';
import { DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui-kit/ui/dialog';
import { cn } from '@/shared/ui-kit/utils';
import { NotebookPen, XIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import { TaskNameInputForm } from './task-name-input-form';

interface TaskHeaderFormProps {
  readonly beforeNameSlot?: ReactNode;
  readonly mode?: 'edit' | 'create';
  readonly onOk?: () => void;
  readonly onCancel?: () => void;
}

interface FormFieldsUsed {
  readonly name?: string;
}

function TaskHeaderForm({ beforeNameSlot, mode = 'create', onOk, onCancel }: TaskHeaderFormProps) {
  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';

  const [editName, setEditName] = useState(isCreate);
  const name = useWatch<FormFieldsUsed>({ name: 'name' });
  const placeholder = 'Задайте имя';
  const { disabled } = useFormState();

  const isMobile = useIsMobile();
  const showCloseButton = isMobile && !editName;

  return (
    <DialogHeader className="flex-row w-full gap-0 mb-0 justify-between">
      <DialogTitle
        className={cn('p-2.5 sm:p-4 flex items-center', [
          showCloseButton ? 'w-[95%] pr-0 sm:pr-0' : 'w-full',
        ])}
      >
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
            <span className="grow text-center md:text-left wrap-break-word break-all">
              {name ?? placeholder}
            </span>

            <NotebookPen
              className="size-4"
              color="var(--color-gray-500)"
              onClick={() => void (!disabled && setEditName(true))}
            />
          </div>
        )}
      </DialogTitle>

      {(!editName || isCreate) && (
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            tabIndex={-1}
            className={cn(
              'size-10 mt-1.5 sm:mt-2 sm:mr-1',
              'opacity-70 hover:bg-transparent hover:opacity-100',
            )}
          >
            <XIcon className="size-4" />
          </Button>
        </DialogTrigger>
      )}
    </DialogHeader>
  );
}

export { TaskHeaderForm };
