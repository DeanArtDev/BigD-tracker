import { useCallback, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { invalidateInboxTasks } from '@/entity/planner/inbox';
import { invalidatePlannerInit, usePlannerInit } from '@/entity/planner/init';
import { TaskId, useTaskAssign } from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';

function useTaskAssignToGroupFeature() {
  const { assignTask, client, ...rest } = useTaskAssign();
  const { data } = usePlannerInit();
  const [loading, setLoading] = useState(false);

  const assignToGroup = useCallback(
    async (
      { groupId, taskId }: { taskId: TaskId; groupId: GroupId },
      params?: { onSuccess?: () => MaybePromise<void> },
    ) => {
      try {
        setLoading(true);
        const response = await assignTask({
          variables: { input: { groupId, taskId } },
        });
        if (!response.data?.assignTaskToGroup || data?.inbox.id == null) return;
        await invalidateInboxTasks(client, data.inbox.id);
        await invalidatePlannerInit(client.cache);
        await params?.onSuccess?.();
      } finally {
        setLoading(false);
      }
    },
    [assignTask, client, data.inbox.id],
  );

  return {
    assignToGroup,
    client,
    ...rest,
    loading: loading || rest.loading,
  };
}

export { useTaskAssignToGroupFeature };
