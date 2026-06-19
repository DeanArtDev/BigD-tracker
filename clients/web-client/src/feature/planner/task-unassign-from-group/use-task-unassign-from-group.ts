import { useCallback } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { invalidateInboxTasks } from '@/entity/planner/inbox';
import { invalidatePlannerInit } from '@/entity/planner/init';
import { TaskId, useTaskUnassign } from '@/entity/planner/tasks';

function useTaskUnassignFromGroup() {
  const { unassignTask, client, ...rest } = useTaskUnassign();

  const unassignTaskFromGroup = useCallback(
    ({ groupId, taskId }: { taskId: TaskId; groupId: GroupId }) => {
      return unassignTask({
        variables: { input: { groupId, taskId } },

        async onCompleted(data) {
          if (!data.unassignTaskToGroup) return;
          await invalidateInboxTasks(client, groupId);
          await invalidatePlannerInit(client.cache);
        },
      });
    },
    [client, unassignTask],
  );

  return {
    unassignTaskFromGroup,
    ...rest,
  };
}

export { useTaskUnassignFromGroup };
