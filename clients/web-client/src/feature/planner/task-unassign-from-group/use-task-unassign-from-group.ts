import { useCallback, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskId, useTaskUnassign } from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';

function useTaskUnassignFromGroup() {
  const { unassignTask, client, ...rest } = useTaskUnassign();
  const [loading, setLoading] = useState(false);

  const unassignTaskFromGroup = useCallback(
    async (
      { groupId, taskId }: { taskId: TaskId; groupId: GroupId },
      params?: { onSuccess?: (data: { taskId: TaskId }) => MaybePromise<void> },
    ) => {
      try {
        setLoading(true);

        const result = await unassignTask({
          variables: { input: { groupId, taskId } },
          awaitRefetchQueries: true,
        });

        if (result?.data != null) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          await params?.onSuccess?.({ taskId });
        }
      } finally {
        setLoading(false);
      }
    },
    [unassignTask],
  );

  return {
    unassignTaskFromGroup,
    ...rest,
    client,
    loading: loading || rest.loading,
  };
}

export { useTaskUnassignFromGroup };
