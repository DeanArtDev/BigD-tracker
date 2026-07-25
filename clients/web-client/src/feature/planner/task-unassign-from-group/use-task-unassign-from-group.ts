import { useCallback, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { invalidateInboxTasks } from '@/entity/planner/inbox';
import { invalidatePlannerInit } from '@/entity/planner/init';
import { TaskId, useTaskUnassign } from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';

function useTaskUnassignFromGroup() {
  const { unassignTask, client, ...rest } = useTaskUnassign();
  const [loading, setLoading] = useState(false);

  const unassignTaskFromGroup = useCallback(
    async (
      { groupId, taskId }: { taskId: TaskId; groupId: GroupId },
      params?: { onSuccess?: () => MaybePromise<void> },
    ) => {
      try {
        setLoading(true);
        const result = await unassignTask({
          variables: { input: { groupId, taskId } },
          awaitRefetchQueries: true,
        });

        if (result.data?.unassignTaskToGroup) {
          await invalidateInboxTasks(client, groupId);
          await invalidatePlannerInit(client.cache);
          await params?.onSuccess?.();
        }
      } finally {
        setLoading(false);
      }
    },
    [client, unassignTask],
  );

  return {
    unassignTaskFromGroup,
    ...rest,
    client,
    loading: loading || rest.loading,
  };
}

export { useTaskUnassignFromGroup };
