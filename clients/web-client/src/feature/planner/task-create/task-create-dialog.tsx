'use client';

import { GroupId } from '@/entity/planner/groups';
import {
  TaskForm,
  TaskFormFieldProvider,
  TaskFormFooter,
  TaskFormProvider,
  TaskSubmitFormData,
  useTaskCreate,
  useTaskFromContext,
} from '@/entity/planner/tasks';
import { MaybePromise, useNotify } from '@/shared/lib';
import { AppDialog, useConfirmDialog } from '@/shared/project-ui';
import { SuccessHandler } from './context/task-create.context';

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
      title="Создание дела"
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

interface TaskCreateDialogProps {
  readonly open: ComponentProps['open'];
  readonly groupId?: GroupId;

  readonly onOpenChange: ComponentProps['onOpenChange'];
  readonly onSuccess?: SuccessHandler;
}

function TaskCreateDialog(props: TaskCreateDialogProps) {
  const { groupId, open, onOpenChange, onSuccess } = props;

  const { loading, createTask } = useTaskCreate();

  const { promise } = useNotify();

  return (
    <TaskFormProvider loading={loading}>
      <TaskFormFieldProvider>
        <Component
          open={open}
          onOpenChange={onOpenChange}
          onSubmit={async (taskFormData, close) => {
            const { name, description, deadline, startDate, priority } = taskFormData;

            promise(async () =>
              createTask({
                variables: { input: { name, description, deadline, startDate, priority, groupId } },

                onCompleted: async ({ createTask: ok }) => {
                  if (ok != null) {
                    await onSuccess?.(ok);
                    close();
                  }
                },
              }),
            );
          }}
        />
      </TaskFormFieldProvider>
    </TaskFormProvider>
  );
}

export { TaskCreateDialog, type TaskCreateDialogProps };
