'use client';

import {
  Task,
  TaskForm,
  TaskFormFieldProvider,
  TaskFormFooter,
  TaskFormProvider,
  TaskSubmitFormData,
  useTaskFromContext,
} from '@/entity/planner/tasks';
import { MaybePromise, useNotify } from '@/shared/lib';
import { AppDialog, useConfirmDialog } from '@/shared/project-ui';
import { useTaskUpdate } from './api/use-task-update';

interface ComponentProps {
  readonly open: boolean;
  readonly onOpenChange: (value: boolean) => void;
  readonly onSubmit: (taskFormData: TaskSubmitFormData, close: () => void) => MaybePromise<void>;
}

function Component({ open, onOpenChange, onSubmit }: ComponentProps) {
  const { viaConfirmation } = useConfirmDialog();
  const {
    resetToInit,
    formState: { isDirty },
  } = useTaskFromContext();

  const close = () => {
    onOpenChange(false);
    resetToInit();
  };

  return (
    <AppDialog
      open={open}
      title="Редактирование дела"
      content={<TaskForm className="px-4 py-2" onSubmit={(taskFormData) => void onSubmit(taskFormData, close)} />}
      footer={<TaskFormFooter />}
      onOpenChange={(value) => {
        if (!value && isDirty) {
          viaConfirmation({
            isNeedConfirm: () => isDirty,
            callback: close,
            dialog: { title: 'Закрыть?', content: 'Не сохраненные данные будут потеряны!' },
          });
        } else {
          if (value) {
            onOpenChange(true);
          } else {
            close();
          }
        }
      }}
    />
  );
}

interface TaskUpdateDialogProps {
  readonly open: ComponentProps['open'];
  readonly task: Task | undefined;

  readonly onOpenChange: ComponentProps['onOpenChange'];
  readonly onSuccess?: () => MaybePromise<void>;
}

function TaskUpdateDialog(props: TaskUpdateDialogProps) {
  const { task, open, onOpenChange, onSuccess } = props;

  const { loading, updateTask } = useTaskUpdate();

  const { promise } = useNotify();

  return (
    <TaskFormProvider task={task} loading={loading}>
      <TaskFormFieldProvider taskStatus={task?.status}>
        <Component
          open={open}
          onOpenChange={onOpenChange}
          onSubmit={async (taskFormData, close) => {
            if (task == null) return;
            const { name, description, deadline, startDate, priority } = taskFormData;

            promise(async () => {
              const response = await updateTask({
                variables: { input: { id: task.id, weight: 100, name, description, deadline, startDate, priority } },
              });

              if (response.data?.updateTask != null) {
                close();
                await onSuccess?.();
              }
            });
          }}
        />
      </TaskFormFieldProvider>
    </TaskFormProvider>
  );
}

export { TaskUpdateDialog };
