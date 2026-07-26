import { useCallback, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';
import { useTaskAssign } from './api/use-task-assign';

type AssignTaskHandlerParams = {
  readonly task: {
    readonly groupId?: GroupId;
    readonly id: TaskId;
  };
  readonly groupId: GroupId;
};

function useTaskAssignToGroupFeature() {
  const { assignTask, client, ...rest } = useTaskAssign();
  const [loading, setLoading] = useState(false);

  const assignToGroup = useCallback(
    async (
      { groupId, task }: AssignTaskHandlerParams,
      params?: { onSuccess?: (data: AssignTaskHandlerParams) => MaybePromise<void> },
    ) => {
      assignTask({
        variables: { input: { groupId, taskId: task.id } },
        onCompleted: async ({ assignTaskToGroup: ok }) => {
          if (ok != null) {
            await params?.onSuccess?.({ groupId, task });
          }
          setLoading(false);
        },
      });
    },
    [assignTask],
  );

  return {
    assignToGroup,
    client,
    ...rest,
    loading: loading || rest.loading,
  };
}

export { useTaskAssignToGroupFeature };
