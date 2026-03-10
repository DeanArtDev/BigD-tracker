import { useInvalidateAllGroups } from '@/entity/planner/groups';
import { useInvalidateAllTasks, useUpdateTask } from '@/entity/planner/tasks';
import { TaskFormDialog, type TaskFormDialogProps } from '@/entity/planner/tasks/ui';
import { SidebarActions } from './components/sidebar-actions';
import dayjs from '@/shared/lib/time';

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
          <SidebarActions
            groupId={taskGroupId}
            taskInfo={{ id: task?.id, status: task?.status }}
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

        const { recurrence } = formData;
        const hasRecurrence = recurrence != null && recurrence.frequency != null && recurrence.start != null;

        updateTask(
          {
            params: { path: { taskId: task.id } },
            body: {
              data: {
                ...formData,
                recurrence: hasRecurrence
                  ? {
                      frequency: recurrence.frequency,
                      startDate: dayjs(recurrence.start).utc(true).format('YYYY-MM-DD'),
                      untilDate:
                        recurrence.end != null ? dayjs(recurrence.end).utc(true).format('YYYY-MM-DD') : undefined,
                      weekdays: recurrence?.weekdays,
                    }
                  : undefined,
              },
            },
          },
          { onSuccess: invalidate },
        );
      }}
    />
  );
}

export { TaskEdit, type TaskEditProps };
