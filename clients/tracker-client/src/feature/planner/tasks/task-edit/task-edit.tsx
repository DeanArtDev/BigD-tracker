import { useInvalidateAllGroups } from '@/entity/planner/groups';
import { useInvalidateAllTasks, useUpdateTask } from '@/entity/planner/tasks';
import { TaskFormDialog, type TaskFormDialogProps } from '@/entity/planner/tasks/ui';
import { TaskSidebarActions } from '@/feature/planner/tasks/task-sidebar-actions';

interface TaskEditProps {
  readonly task: TaskFormDialogProps['task'] | null;
  readonly taskGroupId?: number;
  readonly onSuccess?: () => void;
  readonly onCansel?: () => void;
}

function TaskEdit({ task, taskGroupId, onSuccess, onCansel }: TaskEditProps) {
  const open = task != null;

  const { updateTask, isPending } = useUpdateTask();
  const invalidateTasks = useInvalidateAllTasks();
  const invalidateAllGroups = useInvalidateAllGroups();

  const invalidate = async () => {
    await invalidateTasks();
    await invalidateAllGroups();
    onSuccess?.();
  };

  return (
    <TaskFormDialog
      task={task ?? undefined}
      open={open}
      loading={isPending}
      footerSidebarSlot={() =>
        task != null && (
          <TaskSidebarActions
            groupId={taskGroupId}
            taskInfo={{ id: task?.id, status: task.status, type: task.type }}
            onFinishSuccess={onSuccess}
            onAssignSuccess={onSuccess}
            onDeleteSuccess={onSuccess}
            onRecoverSuccess={onSuccess}
            onDeleteCompleteSuccess={onSuccess}
          />
        )
      }
      onOpenChange={(isOpen) => {
        !isOpen && onCansel?.();
      }}
      onSubmit={(formData) => {
        if (task == null) return;
        const { isRecurrence: _, ...data } = formData;

        updateTask(
          {
            params: { path: { taskId: task.id } },
            body: { data },
          },
          { onSuccess: invalidate },
        );
      }}
    />
  );
}

export { TaskEdit, type TaskEditProps };
