'use client';

import { GroupId } from '@/entity/planner/groups';
import {
  TaskForm,
  TaskFormFieldProvider,
  TaskFormFooter,
  TaskFormProvider,
  TaskSubmitFormData,
  useTaskFromContext,
} from '@/entity/planner/tasks';
import { Brand, MaybePromise } from '@/shared/lib';
import { AppDialog, useConfirmDialog, useNotify } from '@/shared/project-ui';
import { TaskCacheManager } from '@/shared/transport/graphql';
import { useTaskCreate } from './api/use-task-create';
import { SuccessHandler } from './context/task-create.context';

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
  } = useTaskFromContext();

  const close = () => {
    onOpenChange(false);
    resetToInit();
  };

  return (
    <AppDialog
      open={open}
      title="Создание дела"
      content={
        <TaskForm<TGroupId> className="px-4 py-2" onSubmit={(taskFormData) => void onSubmit(taskFormData, close)} />
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

interface TaskCreateDialogProps<TGroupId extends Brand<number, string>> {
  readonly open: ComponentProps<TGroupId>['open'];
  readonly groupId?: GroupId;

  readonly onOpenChange: ComponentProps<TGroupId>['onOpenChange'];
  readonly onSuccess?: SuccessHandler;
}

function TaskCreateDialog<TGroupId extends Brand<number, string>>(props: TaskCreateDialogProps<TGroupId>) {
  const { groupId, open, onOpenChange, onSuccess } = props;

  const { loading, client, createTask } = useTaskCreate();

  const { promise } = useNotify();

  return (
    <TaskFormProvider<TGroupId> loading={loading}>
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
                    TaskCacheManager.refetchAssignableTasks(client);
                    await TaskCacheManager.refetchGetTasksPerPage(client);
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
