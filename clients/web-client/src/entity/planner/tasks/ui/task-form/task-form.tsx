'use client';

import { useTaskFromContext } from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';
import { cn } from '@/shared/ui-kit';
import { InputForm, TextareaForm } from '@/shared/ui-kit/form';
import { TaskFormErrorReactor } from './components/task-form-error-reactor';
import { TaskFormParamsSettings } from './components/task-form-params-settings';
import { TaskFormData, TaskSubmitFormData } from './context/task-form-schema';

interface TaskFormProps {
  readonly className?: string;
  readonly onSubmit: (taskFormData: TaskSubmitFormData) => MaybePromise<void>;
}

function TaskForm({ className, onSubmit }: TaskFormProps) {
  const { formId, handleSubmit } = useTaskFromContext();

  return (
    <>
      <form
        id={formId}
        noValidate
        className={cn('flex grow flex-col gap-2', className)}
        onSubmit={(evt) => {
          evt.preventDefault();
          evt.stopPropagation();

          handleSubmit(async (formData) => {
            await onSubmit(formData);
          })(evt);
        }}
      >
        <InputForm name="name" label="Имя" placeholder="Например, 10 раз отжаться!" isErrorMessage={false} />

        <TextareaForm
          name="description"
          label="Описание"
          classNames={{ textarea: 'resize-none h-75' }}
          placeholder="Добавь детали, контекст и ожидаемый результат."
        />

        <TaskFormParamsSettings />
      </form>

      <TaskFormErrorReactor />
    </>
  );
}

export { TaskForm, type TaskFormData };
