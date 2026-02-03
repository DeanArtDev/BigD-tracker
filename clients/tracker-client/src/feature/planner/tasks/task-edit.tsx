import { useGroupInvalidate } from '@/entity/planner/groups';
import { useInvalidateDiaryTasks, useUpdateTask } from '@/entity/planner/tasks';
import {
  TaskDeleteWithConfirmHoc,
  TaskFormDialog,
  type TaskFormDialogProps,
} from '@/entity/planner/tasks/ui';
import { TaskCloningButton } from '@/feature/planner/tasks/task-cloning-button';
import { ButtonTrash } from '@/shared/components/button-trash';

interface TaskEditProps {
  readonly task: TaskFormDialogProps['task'] | null;
  readonly groupId?: number;
  readonly onSuccess?: () => void;
  readonly onCansel?: () => void;
}

function TaskEdit({ task, groupId, onSuccess, onCansel }: TaskEditProps) {
  const open = task != null;

  const { updateTask, isPending } = useUpdateTask();
  const invalidateTasks = useInvalidateDiaryTasks();
  const invalidateGroups = useGroupInvalidate();
  const invalidateDiaryTasks = useInvalidateDiaryTasks();

  const DeleteTaskSlot = (props: { disabled: boolean }) => {
    if (task == null) return null;
    return (
      <TaskDeleteWithConfirmHoc
        taskId={task.id}
        onSuccess={async () => {
          await invalidateTasks();
          await invalidateGroups();
          onCansel?.();
        }}
      >
        {({ isLoading }) => (
          <ButtonTrash disabled={props.disabled} className="mr-auto" isLoading={isLoading} />
        )}
      </TaskDeleteWithConfirmHoc>
    );
  };

  return (
    <TaskFormDialog
      task={task ?? undefined}
      open={open}
      loading={isPending}
      footerSlot={DeleteTaskSlot}
      footerSidebarSlot={() =>
        task != null ? (
          <TaskCloningButton
            className="w-fit ml-auto"
            taskId={task.id}
            groupId={groupId}
            onSuccess={async () => {
              await invalidateTasks();
              await invalidateGroups();
              await invalidateDiaryTasks();
            }}
          >
            Клонировать в группу
          </TaskCloningButton>
        ) : null
      }
      onOpenChange={(isOpen) => {
        !isOpen && onCansel?.();
      }}
      onSubmit={(formData) => {
        if (task == null) return;

        updateTask(
          {
            params: { path: { taskId: task.id } },
            body: { data: formData },
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
