import { useInvalidateAllGroups } from '@/entity/planner/groups';
import {
  type TaskEntity,
  useAssignTaskToGroup,
  useDeleteCompleteTask,
  useDeleteTask,
  useInvalidateAllTasks,
  useTaskClone,
  useTaskFinish,
  useTaskRecoveryTask,
} from '@/entity/planner/tasks';
import { useConfirmDialog } from '@/shared/ui-kit/helpers';
import { toast } from 'sonner';

interface UseTaskActionsHandlersProps {
  readonly prevGroupId?: number;
  readonly onFinishSuccess?: () => Promise<void> | void;
  readonly onAssignSuccess?: () => Promise<void> | void;
  readonly onRecoverSuccess?: () => Promise<void> | void;
  readonly onDeleteSuccess?: () => Promise<void> | void;
  readonly onDeleteCompleteSuccess?: () => Promise<void> | void;
  readonly onCloneSuccess?: () => Promise<void> | void;
}

function useTaskActionsHandlers(props: UseTaskActionsHandlersProps) {
  const {
    prevGroupId,

    onFinishSuccess,
    onAssignSuccess,
    onRecoverSuccess,
    onDeleteSuccess,
    onCloneSuccess,
    onDeleteCompleteSuccess,
  } = props;

  const { confirmHolder, viaConfirmation } = useConfirmDialog();

  const { finishTask, isPending: isTaskFinishPending } = useTaskFinish();
  const { cloneTask, isPending: isTaskClonePending } = useTaskClone();
  const { deleteTask, isPending: isDeletePending } = useDeleteTask();
  const { deleteCompleteTask, isPending: isDeleteCompletePending } = useDeleteCompleteTask();
  const { recoveryTask, isPending: isTaskRecoveryPending } = useTaskRecoveryTask();
  const { assignTaskToGroup, isPending: isAssignTaskToGroupPending } = useAssignTaskToGroup();

  const invalidateTasks = useInvalidateAllTasks();
  const invalidateAllGroups = useInvalidateAllGroups();
  const invalidate = async () => {
    await invalidateTasks();
    await invalidateAllGroups();
  };

  const isLoading =
    isAssignTaskToGroupPending ||
    isDeletePending ||
    isTaskFinishPending ||
    isDeleteCompletePending ||
    isTaskClonePending ||
    isTaskRecoveryPending;

  const handleDelete = (taskId: TaskEntity['id']) => {
    viaConfirmation({
      isNeedConfirm: () => true,
      callback: () =>
        void deleteTask(
          { params: { path: { taskId } } },
          {
            onSuccess: async () => {
              await onDeleteSuccess?.();
              await invalidate();
            },
          },
        ),
      dialog: {
        title: 'Удалить?',
        content: 'В будущем, дело можно будет восстановить',
      },
    });
  };

  const handleDeleteComplete = (taskId: TaskEntity['id']) => {
    viaConfirmation({
      isNeedConfirm: () => true,
      callback: () =>
        void deleteCompleteTask(
          { params: { path: { taskId } } },
          {
            onSuccess: async () => {
              await onDeleteCompleteSuccess?.();
              await invalidate();
            },
          },
        ),
      dialog: {
        title: 'Удалить полностью?',
        content: 'Это окончательное удаление, больше дело восстановить будет нельзя',
      },
    });
  };

  const handleFinish = (taskId: TaskEntity['id']) => {
    finishTask(
      { params: { path: { taskId } } },
      {
        onSuccess: async () => {
          await onFinishSuccess?.();
          await invalidate();
          toast.success('Дело завершено!');
        },
      },
    );
  };

  const handleClone = (taskId: TaskEntity['id']) => {
    cloneTask(
      { params: { path: { taskId } } },
      {
        onSuccess: async () => {
          await onCloneSuccess?.();
          await invalidate();
          toast.success('Дублировано!');
        },
      },
    );
  };

  const handleAssign = (taskId: TaskEntity['id'], groupId: number, success?: () => void) => {
    if (prevGroupId === groupId) return;
    assignTaskToGroup(
      { params: { path: { taskId, groupId } } },
      {
        onSuccess: async () => {
          await onAssignSuccess?.();
          await invalidate();
          toast.success('Перемещено!');
          success?.();
        },
      },
    );
  };

  const handleRecovery = (data: { taskId: TaskEntity['id']; groupId: number }, success?: () => void) => {
    recoveryTask(
      { params: { path: { taskId: data.taskId } }, body: { data: { groupId: data.groupId } } },
      {
        onSuccess: async () => {
          await onRecoverSuccess?.();
          await invalidate();
          toast.success('Восстановлено!');
          success?.();
        },
      },
    );
  };

  return {
    isLoading,

    confirmHolder,

    handleDelete,
    handleFinish,
    handleClone,
    handleAssign,
    handleRecovery,
    handleDeleteComplete,
  };
}

export { useTaskActionsHandlers, type UseTaskActionsHandlersProps };
