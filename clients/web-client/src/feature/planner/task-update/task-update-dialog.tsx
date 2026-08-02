'use client';

import { GroupId, GroupLabelBadge } from '@/entity/planner/groups';
import {
  Task,
  TaskForm,
  TaskFormFieldProvider,
  TaskFormFooter,
  TaskFormProvider,
  TaskSubmitFormData,
  useTaskFromContext,
} from '@/entity/planner/tasks';
import { Brand, MaybePromise } from '@/shared/lib';
import { AppDialog, useConfirmDialog, useNotify } from '@/shared/project-ui';
import { useTaskUpdate } from './api/use-task-update';

interface ComponentProps<TGroupId extends Brand<number, string>> {
  readonly open: boolean;
  readonly onOpenChange: (value: boolean) => void;
  readonly onSubmit: (taskFormData: TaskSubmitFormData<TGroupId>, close: () => void) => MaybePromise<void>;
}

function Component<TGroupId extends Brand<number, string>>({ open, onOpenChange, onSubmit }: ComponentProps<TGroupId>) {
  const { viaConfirmation } = useConfirmDialog();
  const {
    resetToInit,
    formState: { isDirty },
    getValues,
  } = useTaskFromContext();

  const close = () => {
    onOpenChange(false);
    resetToInit();
  };

  return (
    <AppDialog
      open={open}
      title="Редактирование дела"
      content={
        <TaskForm<TGroupId>
          className="px-4 py-2"
          groupSlot={<GroupLabelBadge groupId={getValues('groupId') as GroupId} />}
          onSubmit={(taskFormData) => void onSubmit(taskFormData, close)}
        />
      }
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

interface TaskUpdateDialogProps<TGroupId extends Brand<number, string>> {
  readonly open: ComponentProps<TGroupId>['open'];
  readonly task: Task<TGroupId> | undefined;

  readonly onOpenChange: ComponentProps<TGroupId>['onOpenChange'];
  readonly onSuccess?: () => MaybePromise<void>;
}

function TaskUpdateDialog(props: TaskUpdateDialogProps<GroupId>) {
  const { task, open, onOpenChange, onSuccess } = props;

  const { loading, updateTask } = useTaskUpdate();

  const { promise } = useNotify();

  return (
    <TaskFormProvider<GroupId> task={task} loading={loading}>
      <TaskFormFieldProvider taskStatus={task?.status}>
        <Component<GroupId>
          open={open}
          onOpenChange={onOpenChange}
          onSubmit={async (taskFormData, close) => {
            if (task == null) return;
            const { name, description, deadline, startDate, priority } = taskFormData;

            promise(async () => {
              const response = await updateTask({
                variables: { input: { id: task.id, name, description, deadline, startDate, priority } },
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
