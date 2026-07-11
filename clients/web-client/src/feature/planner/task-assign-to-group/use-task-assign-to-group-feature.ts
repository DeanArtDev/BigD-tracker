import { useCallback, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { invalidateInboxTasks } from '@/entity/planner/inbox';
import { invalidatePlannerInit, usePlannerInit } from '@/entity/planner/init';
import { TaskId, useTaskAssign } from '@/entity/planner/tasks';

function useTaskAssignToGroupFeature() {
  const { assignTask, client, ...rest } = useTaskAssign();
  const { data } = usePlannerInit();
  const [loading, setLoading] = useState(false);

  const assignToGroup = useCallback(
    async ({ groupId, taskId }: { taskId: TaskId; groupId: GroupId }) => {
      try {
        setLoading(true);
        const response = await assignTask({
          variables: { input: { groupId, taskId } },
        });
        if (!response.data?.assignTaskToGroup || data?.inbox.id == null) return;
        await invalidateInboxTasks(client, data.inbox.id);
        await invalidatePlannerInit(client.cache);
      } finally {
        setLoading(false);
      }
    },
    [assignTask, client, data.inbox.id],
  );

  return {
    assignToGroup,
    ...rest,
    loading: loading || rest.loading,
  };
}

export { useTaskAssignToGroupFeature };
