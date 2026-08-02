import { useGetUserInbox, useInvalidateInbox } from '@/entity/planner/groups';
import { type TaskInboxEntity, useInvalidateAllTasks } from '@/entity/planner/tasks';
import { useUpdateInboxTask } from '@/entity/planner/tasks/model';
import { TaskFormDialog } from '@/entity/planner/tasks/ui';
import { TaskSidebarActions } from '@/feature/planner/tasks/task-sidebar-actions';

interface TaskInboxUpdateControllerProps {
  readonly inboxTask?: TaskInboxEntity;
  readonly onCancel?: () => void;
  readonly onSuccess?: () => void;
}

function TaskInboxUpdateController({ inboxTask, onCancel, onSuccess }: TaskInboxUpdateControllerProps) {
  const open = inboxTask != null;

  const { inbox } = useGetUserInbox();
  const { updateInboxTask, isPending: isInboxTaskUpdatePending } = useUpdateInboxTask();
  const invalidateInbox = useInvalidateInbox();
  const invalidateAllTasks = useInvalidateAllTasks();

  return (
    <TaskFormDialog
      task={inboxTask ?? undefined}
      open={open}
      options={{ visibility: { recurrence: false } }}
      loading={isInboxTaskUpdatePending}
      footerSidebarSlot={() =>
        inboxTask != null && (
          <TaskSidebarActions
            groupId={inbox?.id}
            taskInfo={{ id: inboxTask?.id, status: inboxTask.status, type: inboxTask.type }}
            onFinishSuccess={onSuccess}
            onAssignSuccess={onSuccess}
            onDeleteSuccess={onSuccess}
            onRecoverSuccess={onSuccess}
            onDeleteCompleteSuccess={onSuccess}
          />
        )
      }
      onOpenChange={(isOpen) => {
        !isOpen && onCancel?.();
      }}
      onSubmit={(data) => {
        if (inboxTask == null) return;

        updateInboxTask(
          {
            params: { path: { taskId: inboxTask.id } },
            body: { data },
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
  );
}

export { TaskInboxUpdateController };
