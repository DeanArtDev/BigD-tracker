import { useInvalidateAllGroups } from '@/entity/planner/groups';
import { useInvalidateDiaryTasks, useUpdateTask } from '@/entity/planner/tasks';
import { isAllowTaskAction } from '@/entity/planner/tasks/lib';
import {
  TaskDeleteWithConfirmHoc,
  TaskFormDialog,
  type TaskFormDialogProps,
} from '@/entity/planner/tasks/ui';
import { SidebarActions } from './components/sidebar-actions';
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
    const deleteButtonDisabled = props.disabled || !isAllowTaskAction('DELETE', task.status);
    return (
      <TaskDeleteWithConfirmHoc
        taskId={task.id}
        onSuccess={async () => {
          await invalidate();
          onCansel?.();
        }}
      >
        {({ isLoading }) => (
          <ButtonTrash disabled={deleteButtonDisabled} className="mr-auto" isLoading={isLoading} />
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
        task != null && (
          <SidebarActions
            taskInfo={{
              groupId,
              id: task?.id,
              status: task?.status,
            }}
            onFinishSuccess={invalidate}
            onCloneSuccess={invalidate}
          />
        )
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
          { onSuccess: invalidate },
        );
      }}
    />
  );
}

export { TaskEdit, type TaskEditProps };
