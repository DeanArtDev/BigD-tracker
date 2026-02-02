import { useGroupInvalidate } from '@/entity/planner/groups';
import { useInvalidateDiaryTasks, useUpdateTask } from '@/entity/planner/tasks';
import { TaskFormDialog, type TaskFormDialogProps } from '@/entity/planner/tasks/ui';

interface TaskEditProps {
  readonly task: TaskFormDialogProps['task'] | null;
  readonly onSuccess?: () => void;
  readonly onCansel?: () => void;
}

function TaskEdit({ task, onSuccess, onCansel }: TaskEditProps) {
  const open = task != null;

  const { updateTask, isPending } = useUpdateTask();
  const invalidateTasks = useInvalidateDiaryTasks();
  const invalidateGroups = useGroupInvalidate();

  return (
    <TaskFormDialog
      task={task ?? undefined}
      open={open}
      loading={isPending}
      onOpenChange={(isOpen) => {
        !isOpen && onCansel?.();
      }}
      onSubmit={(formData) => {
        if (task == null) return;

        updateTask(
          {
            params: { path: { taskId: task.id } },
            body: { data: { ...formData, weight: task.weight } },
          },

          {
            onSuccess: async () => {
              await invalidateGroups();
              await invalidateTasks();
              onSuccess?.();
            },
          },
        );
      }}
    />
  );
}

export { TaskEdit, type TaskEditProps };
