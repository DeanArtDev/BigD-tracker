import { useInvalidateGroupById, useInvalidateGroups } from '@/entity/planner/groups';
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
  readonly groupId: number;
  readonly onSuccess?: () => void;
  readonly onCansel?: () => void;
}

function TaskEdit({ task, groupId, onSuccess, onCansel }: TaskEditProps) {
  const open = task != null;

  const { updateTask, isPending } = useUpdateTask();
  const invalidateTasks = useInvalidateDiaryTasks();
  const invalidateGroups = useInvalidateGroups();
  const invalidateDiaryTasks = useInvalidateDiaryTasks();
  const invalidateGroupById = useInvalidateGroupById();

  const invalidate = async () => {
    await invalidateTasks();
    await invalidateGroups();
    await invalidateDiaryTasks();
    await invalidateGroupById({ groupId });
  };

  const DeleteTaskSlot = (props: { disabled: boolean }) => {
    if (task == null) return null;
    return (
      <TaskDeleteWithConfirmHoc
        taskId={task.id}
        onSuccess={async () => {
          await invalidate();
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
              await invalidate();
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
              await invalidate();
              onSuccess?.();
            },
          },
        );
      }}
    />
  );
}

export { TaskEdit, type TaskEditProps };
