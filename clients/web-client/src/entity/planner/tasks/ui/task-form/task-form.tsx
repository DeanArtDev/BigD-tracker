'use client';

import { useTaskFromContext } from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';
import { useWysiwygController } from '@/shared/project-ui';
import { WysiwygForm } from '@/shared/project-ui/form';
import { cn } from '@/shared/ui-kit';
import { InputForm } from '@/shared/ui-kit/form';
import { TaskFormErrorReactor } from './components/task-form-error-reactor';
import { TaskFormParamsSettings } from './components/task-form-params-settings';
import { TaskFormData, TaskSubmitFormData } from './context/task-form-schema';

interface TaskFormProps {
  readonly className?: string;
  readonly onSubmit: (taskFormData: TaskSubmitFormData) => MaybePromise<void>;
}

function TaskForm({ className, onSubmit }: TaskFormProps) {
  const { formId, handleSubmit, setValue } = useTaskFromContext();
  const { wysiwygController } = useWysiwygController();

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
            const description = wysiwygController.current?.getStateAsString?.();
            await onSubmit({ ...formData, description });
          })(evt);
        }}
      >
        <InputForm name="name" label="Имя" placeholder="Например, 10 раз отжаться!" isErrorMessage={false} />

        <WysiwygForm
          name="description"
          classNames={{ wrapper: 'border rounded-xl h-120' }}
          placeholder="Добавь детали, контекст и ожидаемый результат."
          wysiwygController={wysiwygController}
          onDirtyChange={(isDirty) => {
            setValue('isDescriptionDirty', isDirty, { shouldDirty: true });
          }}
        />

        <TaskFormParamsSettings />
      </form>

      <TaskFormErrorReactor />
    </>
  );
}

export { TaskForm, type TaskFormData };
