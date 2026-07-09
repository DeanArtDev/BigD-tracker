import { useCallback, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { invalidateInboxTasks } from '@/entity/planner/inbox';
import { invalidatePlannerInit } from '@/entity/planner/init';
import { TaskId, useTaskAssign } from '@/entity/planner/tasks';

function useTaskAssignToGroupFeature() {
  const { assignTask, client, ...rest } = useTaskAssign();
  const [loading, setLoading] = useState(false);

  const assignToGroup = useCallback(
    async ({ groupId, taskId }: { taskId: TaskId; groupId: GroupId }) => {
      setLoading(true);
      const response = await assignTask({
        variables: { input: { groupId, taskId } },
      });
      if (!response.data?.assignTaskToGroup) return;
      await invalidateInboxTasks(client, groupId);
      await invalidatePlannerInit(client.cache);
      setLoading(false);
    },
    [assignTask, client],
  );

  return {
    assignToGroup,
    ...rest,
    loading: loading || rest.loading,
  };
}

export { useTaskAssignToGroupFeature };
