import { AssignInboxTaskToGroupDialog } from '@/entity/planner/groups/ui';
import { TaskStatus } from '@/entity/planner/tasks';
import { TaskActionsDropdown } from '@/entity/planner/tasks/ui';
import { useTaskActionsHandlers } from './use-task-actions-handlers';
import { useState } from 'react';

interface TaskActionsProps {
  readonly taskId: number;
  readonly groupId?: number;
  readonly status: TaskStatus;

  readonly trigger?: {
    readonly className?: string;
  };

  readonly onFinishSuccess?: () => Promise<void> | void;
  readonly onAssignSuccess?: () => Promise<void> | void;
  readonly onRecoverSuccess?: () => Promise<void> | void;
  readonly onDeleteSuccess?: () => Promise<void> | void;
  readonly onCloneSuccess?: () => Promise<void> | void;
}

function TaskActions({
  taskId,
  status,
  groupId,
  trigger,
  onFinishSuccess,
  onAssignSuccess,
  onRecoverSuccess,
  onDeleteSuccess,
  onCloneSuccess,
}: TaskActionsProps) {
  const {
    isLoading,

    confirmHolder,

    handleDelete,
    handleFinish,
    handleClone,
    handleAssign,
    handleAssignToInbox,
    handleRecovery,
  } = useTaskActionsHandlers({
    onFinishSuccess,
    onAssignSuccess,
    onRecoverSuccess,
    onDeleteSuccess,
    onCloneSuccess,
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
        taskStatus={status}
        onAssign={() => void setAssignOpen(true)}
        onFinish={() => void handleFinish(taskId)}
        onDelete={() => void handleDelete(taskId)}
        onRecover={() => void setRecoveryOpen(true)}
        onClone={() => void handleClone(taskId, groupId)}
      />

      {confirmHolder}

      <AssignInboxTaskToGroupDialog
        open={recoveryOpen || assignOpen}
        taskGroupId={groupId}
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
        onInboxSelect={(groupInfo, close) => {
          if (isRecoveryTurn) {
            handleRecovery({ taskId, groupId: groupInfo.id }, close);
            return;
          }

          if (isAssignTurn) {
            handleAssignToInbox(taskId, close);
          }
        }}
      />
    </>
  );
}

export { TaskActions, type TaskActionsProps };
