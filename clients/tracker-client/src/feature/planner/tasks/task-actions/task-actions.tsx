import { AssignTaskToGroupDialog } from '@/entity/planner/groups/ui';
import { type TaskEntity, TaskStatus, TaskType } from '@/entity/planner/tasks';
import { TaskActionsDropdown } from '@/entity/planner/tasks/ui';
import { useState } from 'react';
import { useTaskActionsHandlers } from './use-task-actions-handlers';

interface TaskActionsProps {
  readonly taskId: TaskEntity['id'];
  readonly groupId?: number;
  readonly status: TaskStatus;
  readonly type: TaskType;

  readonly trigger?: {
    readonly className?: string;
  };

  readonly onFinishSuccess?: () => Promise<void> | void;
  readonly onAssignSuccess?: () => Promise<void> | void;
  readonly onRecoverSuccess?: () => Promise<void> | void;
  readonly onDeleteSuccess?: () => Promise<void> | void;
  readonly onDeleteCompleteSuccess?: () => Promise<void> | void;
  readonly onCloneSuccess?: () => Promise<void> | void;
}

function TaskActions({
  taskId,
  status,
  type,
  groupId,
  trigger,
  onFinishSuccess,
  onAssignSuccess,
  onRecoverSuccess,
  onDeleteSuccess,
  onCloneSuccess,
  onDeleteCompleteSuccess,
}: TaskActionsProps) {
  const {
    isLoading,

    confirmHolder,
    finishDialogHolder,

    handleDelete,
    handleFinish,
    handleClone,
    handleAssign,
    handleRecovery,
    handleDeleteComplete,
  } = useTaskActionsHandlers({
    prevGroupId: groupId,
    onFinishSuccess,
    onAssignSuccess,
    onRecoverSuccess,
    onDeleteSuccess,
    onCloneSuccess,
    onDeleteCompleteSuccess,
  });

  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const isRecoveryTurn = recoveryOpen && !assignOpen;
  const isAssignTurn = assignOpen && !recoveryOpen;

  return (
    <>
      <TaskActionsDropdown
        triggerClassName={trigger?.className}
        loading={isLoading}
        taskType={type}
        taskStatus={status}
        onAssign={() => void setAssignOpen(true)}
        onFinish={() => void handleFinish(taskId)}
        onDelete={() => void handleDelete(taskId)}
        onRecover={() => void setRecoveryOpen(true)}
        onClone={() => void handleClone(taskId)}
        onDeleteComplete={() => void handleDeleteComplete(taskId)}
      />

      {confirmHolder}
      {finishDialogHolder}

      <AssignTaskToGroupDialog
        taskGroupId={groupId}
        open={recoveryOpen || assignOpen}
        loading={isLoading}
        onOpenChange={(value) => {
          if (!value) {
            setAssignOpen(false);
            setRecoveryOpen(false);
          }
        }}
        onSelect={(groupInfo, close) => {
          if (isRecoveryTurn) {
            handleRecovery({ taskId, groupId: groupInfo.id }, close);
            return;
          }

          if (isAssignTurn) {
            handleAssign(taskId, groupInfo.id, close);
          }
        }}
      />
    </>
  );
}

export { TaskActions, type TaskActionsProps };
