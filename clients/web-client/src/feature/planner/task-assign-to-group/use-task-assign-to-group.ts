import { useCallback } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { invalidateInboxTasks } from '@/entity/planner/inbox';
import { invalidatePlannerInit } from '@/entity/planner/init';
import { TaskId, useTaskAssign } from '@/entity/planner/tasks';

function useTaskAssignToGroup() {
  const { assignTask, client, ...rest } = useTaskAssign();

  const assignToGroup = useCallback(
    ({ groupId, taskId }: { taskId: TaskId; groupId: GroupId }) => {
      return assignTask({
        variables: { input: { groupId, taskId } },

        async onCompleted(data) {
          if (!data.assignTaskToGroup) return;
          await invalidateInboxTasks(client, groupId);
          await invalidatePlannerInit(client.cache);
        },
      });
    },
    [assignTask, client],
  );

  return {
    assignToGroup,
    ...rest,
  };
}

export { useTaskAssignToGroup };
