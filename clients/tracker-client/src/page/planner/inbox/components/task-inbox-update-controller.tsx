import { useInvalidateInbox } from '@/entity/planner/groups';
import { type TaskInboxEntity, useInvalidateAllTasks } from '@/entity/planner/tasks';
import { useUpdateInboxTask } from '@/entity/planner/tasks/model';
import { TaskSidebarActions } from '@/feature/planner/tasks/task-sidebar-actions';
import { useFormStateEmitter } from '@/shared/components/form';
import { withLazy } from '@/shared/lib/react/with-lazy';
import { useConfirmDialog } from '@/shared/ui-kit/helpers';
import { AppDialog, AppDialogTrigger } from '@/shared/ui-kit/ui/app-dialog';

const TaskInboxFormLazy = withLazy(() =>
  import('@/entity/planner/tasks/ui/form').then((m) => ({ default: m.TaskInboxForm })),
);

interface TaskInboxUpdateControllerProps {
  readonly inboxTask?: TaskInboxEntity;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}

function TaskInboxUpdateController({ inboxTask, onCancel, onSuccess }: TaskInboxUpdateControllerProps) {
  const { formEmitterState, formStateEmitterProps } = useFormStateEmitter();
  const { confirmHolder, viaConfirmation } = useConfirmDialog();
  const open = inboxTask != null;

  const { updateInboxTask, isPending: isInboxTaskUpdatePending } = useUpdateInboxTask();
  const invalidateInbox = useInvalidateInbox();
  const invalidateAllTasks = useInvalidateAllTasks();

  return (
    <>
      <AppDialog
        modal={false}
        open={open}
        className="sm:h-full sm:max-h-[60vh] p-0 sm:p-0"
        onOpenChange={(value) => {
          if (formEmitterState.isLoading) return;

          viaConfirmation({
            isNeedConfirm: () => formEmitterState.isDirty && !value,
            callback: () => void onCancel?.(),
            dialog: { title: 'Закрыть?', content: 'Не сохраненные данные будут потеряны!' },
          });
        }}
      >
        <TaskInboxFormLazy
          inboxTask={inboxTask}
          isLoading={isInboxTaskUpdatePending}
          {...formStateEmitterProps}
          afterNameSlot={<AppDialogTrigger />}
          footerSidebarSlot={
            inboxTask != null ? (
              <TaskSidebarActions
                groupId={1}
                taskInfo={{ id: inboxTask.id, status: inboxTask.status, type: inboxTask.type }}
                onFinishSuccess={onSuccess}
                onAssignSuccess={onSuccess}
                onDeleteSuccess={onSuccess}
                onRecoverSuccess={onSuccess}
                onDeleteCompleteSuccess={onSuccess}
              />
            ) : null
          }
          onSubmit={(formResult) => {
            if (inboxTask == null) return;

            updateInboxTask(
              {
                params: { path: { taskId: inboxTask.id } },
                body: { data: formResult },
              },
              {
                onSuccess: async () => {
                  await invalidateAllTasks();
                  await invalidateInbox();
                  onSuccess?.();
                },
              },
            );
          }}
        />
      </AppDialog>

      {confirmHolder}
    </>
  );
}

export { TaskInboxUpdateController };
