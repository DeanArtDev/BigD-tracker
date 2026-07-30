import { useTaskAssignToGroupFeature } from '@/feature/planner/task-assign-to-group';
import { useTaskCloneFeature } from '@/feature/planner/task-clone';
import { useTaskDeleteFeature } from '@/feature/planner/task-delete';
import { useTaskFinishFeature } from '@/feature/planner/task-finish';
import { useTaskRecovery } from '@/feature/planner/task-recovery';
import { useTaskUnassignFromGroup } from '@/feature/planner/task-unassign-from-group';

function useTaskActionsFeature() {
  const { assignToGroup, loading: isTaskAssignLoading } = useTaskAssignToGroupFeature();
  const { unassignTaskFromGroup, loading: isTaskUnassignLoading } = useTaskUnassignFromGroup();
  const { deleteTask, client, loading: isTaskDeleteLoading } = useTaskDeleteFeature();
  const { cloneTask, loading: isTaskCloneLoading } = useTaskCloneFeature();
  const { finishTask, loading: isTaskFinishLoading, taskFinishDialogHolder } = useTaskFinishFeature();
  const { recoveryTask, loading: isTaskRecoveryLoading } = useTaskRecovery();

  const isActionLoading =
    isTaskFinishLoading ||
    isTaskDeleteLoading ||
    isTaskUnassignLoading ||
    isTaskAssignLoading ||
    isTaskCloneLoading ||
    isTaskRecoveryLoading;

  return {
    client,
    isActionLoading,

    taskFinishDialogHolder,

    taskAssignHandler: assignToGroup,
    taskDeleteHandler: deleteTask,
    taskUnassignHandler: unassignTaskFromGroup,
    taskCloneHandler: cloneTask,
    taskFinishHandler: finishTask,
    taskRecoveryHandler: recoveryTask,
  };
}

export { useTaskActionsFeature };
