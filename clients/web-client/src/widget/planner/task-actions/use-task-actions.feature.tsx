import { useTaskAssignToGroupFeature } from '@/feature/planner/task-assign-to-group';
import { useTaskCopyFeature } from '@/feature/planner/task-copy';
import { useTaskDeleteFeature } from '@/feature/planner/task-delete';
import { useTaskFinishFeature } from '@/feature/planner/task-finish';
import { useTaskUnassignFromGroup } from '@/feature/planner/task-unassign-from-group';

function useTaskActionsFeature() {
  const { assignToGroup, loading: isTaskAssignLoading } = useTaskAssignToGroupFeature();
  const { unassignTaskFromGroup, loading: isTaskUnassignLoading } = useTaskUnassignFromGroup();
  const { deleteTask, client, loading: isTaskDeleteLoading } = useTaskDeleteFeature();
  const { copyTask, loading: isTaskCopyLoading } = useTaskCopyFeature();
  const { finishTask, loading: isTaskFinishLoading, taskFinishDialogHolder } = useTaskFinishFeature();

  const isActionLoading =
    isTaskFinishLoading || isTaskDeleteLoading || isTaskUnassignLoading || isTaskAssignLoading || isTaskCopyLoading;

  return {
    client,
    isActionLoading,

    taskFinishDialogHolder,

    taskAssignHandler: assignToGroup,
    taskDeleteHandler: deleteTask,
    taskUnassignHandler: unassignTaskFromGroup,
    taskCopyHandler: copyTask,
    taskFinishHandler: finishTask,
  };
}

export { useTaskActionsFeature };
