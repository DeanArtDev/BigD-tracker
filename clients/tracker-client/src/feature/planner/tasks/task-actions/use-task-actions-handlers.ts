import { useInvalidateAllGroups } from '@/entity/planner/groups';
import {
  useAssignTaskToGroup,
  useAssignTaskToInbox,
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
  readonly onFinishSuccess?: () => Promise<void> | void;
  readonly onAssignSuccess?: () => Promise<void> | void;
  readonly onRecoverSuccess?: () => Promise<void> | void;
  readonly onDeleteSuccess?: () => Promise<void> | void;
  readonly onDeleteCompleteSuccess?: () => Promise<void> | void;
  readonly onCloneSuccess?: () => Promise<void> | void;
}

function useTaskActionsHandlers(props: UseTaskActionsHandlersProps) {
  const {
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
  const { assignTaskToInbox, isPending: isAssignTaskToInboxPending } = useAssignTaskToInbox();
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
    isAssignTaskToInboxPending ||
    isDeletePending ||
    isTaskFinishPending ||
    isDeleteCompletePending ||
    isTaskClonePending ||
    isTaskRecoveryPending;

  const handleDelete = (taskId: number) => {
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

  const handleDeleteComplete = (taskId: number) => {
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

  const handleFinish = (taskId: number) => {
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

  const handleClone = (taskId: number, groupId?: number) => {
    cloneTask(
      { params: { path: { taskId } }, body: { data: { groupId } } },
      {
        onSuccess: async () => {
          await onCloneSuccess?.();
          await invalidate();
          toast.success('Дублировано!');
        },
      },
    );
  };

  const handleAssign = (taskId: number, groupId: number, success?: () => void) => {
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

  const handleAssignToInbox = (taskId: number, success?: () => void) => {
    assignTaskToInbox(
      { params: { path: { taskId } } },
      {
        onSuccess: async () => {
          await onAssignSuccess?.();
          await invalidate();
          toast.success('Перемещено в IN BOX!');
          success?.();
        },
      },
    );
  };

  const handleRecovery = (data: { taskId: number; groupId?: number }, success?: () => void) => {
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
    handleAssignToInbox,
    handleRecovery,
    handleDeleteComplete,
  };
}

export { useTaskActionsHandlers, type UseTaskActionsHandlersProps };
