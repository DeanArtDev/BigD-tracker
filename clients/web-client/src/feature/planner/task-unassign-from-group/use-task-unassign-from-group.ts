import { useCallback, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { currentTasksStatuses, TaskId } from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';
import { useNotify } from '@/shared/project-ui';
import {
  GroupCacheManager,
  InboxGroupCacheManager,
  PlannerInitCacheManager,
  TaskCacheManager,
} from '@/shared/transport/graphql';
import { useTaskUnassign } from './api/use-task-unassign';

function useTaskUnassignFromGroup() {
  const { promise } = useNotify();

  const { unassignTask, client, ...rest } = useTaskUnassign();
  const [loading, setLoading] = useState(false);

  const unassignTaskFromGroup = useCallback(
    async (
      { groupId, taskId }: { taskId: TaskId; groupId: GroupId },
      params?: { onSuccess?: (data: { taskId: TaskId }) => MaybePromise<void>; showToast?: boolean },
    ) => {
      const { showToast = true, onSuccess } = params ?? {};

      const mutation = async () => {
        try {
          setLoading(true);

          const result = await unassignTask({
            variables: { input: { groupId, taskId } },
            awaitRefetchQueries: true,
          });

          if (result?.data != null) {
            GroupCacheManager.removeTaskFromGroup(client.cache, { groupId, taskId });
            TaskCacheManager.refetchAssignableTasks(client);
            TaskCacheManager.dropGetTasksPerPageByStatuses(client, currentTasksStatuses);

            PlannerInitCacheManager.refetch(client);
            InboxGroupCacheManager.removeTask(client.cache, { inboxId: groupId, taskId });

            await onSuccess?.({ taskId });
            client.cache.gc();
          }
        } finally {
          setLoading(false);
        }
      };

      const ranMutation = mutation();
      if (showToast) promise(ranMutation);
      return ranMutation;
    },
    [client, promise, unassignTask],
  );

  return {
    unassignTaskFromGroup,
    ...rest,
    client,
    loading: loading || rest.loading,
  };
}

export { useTaskUnassignFromGroup };
