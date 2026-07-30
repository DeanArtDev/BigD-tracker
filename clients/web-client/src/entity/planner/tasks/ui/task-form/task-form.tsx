'use client';

import { ReactNode } from 'react';
import { MaybePromise } from '@/shared/lib';
import { useWysiwygController } from '@/shared/project-ui';
import { WysiwygForm } from '@/shared/project-ui/form';
import { cn } from '@/shared/ui-kit';
import { InputForm } from '@/shared/ui-kit/form';
import { TaskFormErrorReactor } from './components/task-form-error-reactor';
import { TaskFormParamsSettings } from './components/task-form-params-settings';
import { useTaskFormFieldContext } from './context/task-form-field-provider';
import { TaskSubmitFormData, useTaskFromContext } from './context/task-form-provider';

interface TaskFormProps {
  readonly className?: string;
  readonly groupSlot?: ReactNode;
  readonly onSubmit: (taskFormData: TaskSubmitFormData) => MaybePromise<void>;
}

function TaskForm({ className, groupSlot, onSubmit }: TaskFormProps) {
  const { formId, handleSubmit, setValue } = useTaskFromContext();
  const { wysiwygController } = useWysiwygController();

  const { fieldsState } = useTaskFormFieldContext();
  const { name, description } = fieldsState;

  return (
    <>
      <form
        id={formId}
        noValidate
        className={cn('flex grow flex-col gap-2 min-w-0', className)}
        onSubmit={(evt) => {
          evt.preventDefault();
          evt.stopPropagation();

          handleSubmit(async (formData) => {
            const description = wysiwygController.current?.getStateAsString?.();
            await onSubmit({ ...formData, description });
          })(evt);
        }}
      >
        {!name.hidden && (
          <InputForm
            name="name"
            label="Имя"
            disabled={name.disabled}
            placeholder="Например, 10 раз отжаться!"
            isErrorMessage={false}
          />
        )}

        <TaskFormParamsSettings groupSlot={groupSlot} />

        {!description.hidden && (
          <WysiwygForm
            name="description"
            disabled={description.disabled}
            classNames={{ wrapper: 'border rounded-xl h-120' }}
            placeholder="Добавь детали, контекст и ожидаемый результат."
            wysiwygController={wysiwygController}
            onDirtyChange={(isDirty) => {
              setValue('isDescriptionDirty', isDirty, { shouldDirty: true });
            }}
          />
        )}
      </form>

      <TaskFormErrorReactor />
    </>
  );
}

export { TaskForm };
