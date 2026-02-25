import { useInvalidateAllGroups } from '@/entity/planner/groups';
import { useDeleteTask, useInvalidateAllTasks, useTaskFinish } from '@/entity/planner/tasks';
import { useConfirmDialog } from '@/shared/ui-kit/helpers';

function useTasksPageActions() {
  const { confirmHolder, viaConfirmation } = useConfirmDialog();

  const { deleteTask, isPending: isDeletePending } = useDeleteTask();
  const { finishTask, isPending: isFinishPending } = useTaskFinish();
  const isLoading = isDeletePending || isFinishPending;

  const invalidateAllGroups = useInvalidateAllGroups();
  const invalidateDiaryTasks = useInvalidateAllTasks();
  const invalidate = async () => {
    await invalidateDiaryTasks();
    await invalidateAllGroups();
  };

  const handleFinish = (taskId: number) => {
    finishTask({ params: { path: { taskId } } }, { onSuccess: invalidate });
  };

  const handleDelete = (taskId: number) => {
    viaConfirmation({
      isNeedConfirm: () => true,
      callback: () => void deleteTask({ params: { path: { taskId } } }, { onSuccess: invalidate }),
      dialog: {
        title: 'Удалить?',
        content: 'В будущем, дело можно будет восстановить',
      },
    });
  };

  return {
    isLoading,
    confirmHolder,

    handleFinish,
    handleDelete,
  };
}

export { useTasksPageActions };
