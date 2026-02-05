import { useInvalidateAllGroups } from '@/entity/planner/groups';
import { useInvalidateDiaryTasks, useUpdateTask } from '@/entity/planner/tasks';
import {
  TaskDeleteWithConfirmHoc,
  TaskFormDialog,
  type TaskFormDialogProps,
} from '@/entity/planner/tasks/ui';
import { SidebarActions } from './components/sidebar-actions';
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
  const invalidateDiaryTasks = useInvalidateDiaryTasks();
  const invalidateAllGroups = useInvalidateAllGroups();

  const invalidate = async () => {
    await invalidateTasks();
    await invalidateDiaryTasks();
    await invalidateAllGroups();
    onSuccess?.();
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
      footerSidebarSlot={() => (
        <SidebarActions
          groupId={groupId}
          taskId={task?.id}
          onFinishSuccess={invalidate}
          onCloneSuccess={invalidate}
        />
      )}
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
          { onSuccess: invalidate },
        );
      }}
    />
  );
}

export { TaskEdit, type TaskEditProps };
