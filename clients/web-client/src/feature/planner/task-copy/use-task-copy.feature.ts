import { useCallback, useState } from 'react';
import { invalidateInboxTasks } from '@/entity/planner/inbox';
import { invalidatePlannerInit } from '@/entity/planner/init';
import { TaskId } from '@/entity/planner/tasks';
import { useTaskCopy } from '@/entity/planner/tasks/model';
import { useNotify } from '@/shared/lib';
import { GroupCacheManager, InboxGroupCacheManager, PlannerInitCacheManager } from '@/shared/transport/graphql';

function useTaskCopyFeature() {
  const { copyTask, ...rest } = useTaskCopy();
  const { promise } = useNotify();

  const [loading, setLoading] = useState(false);

  const copyTaskHandler = useCallback(
    (id: TaskId) => {
      promise(async () => {
        try {
          setLoading(true);
          const response = await copyTask({
            variables: { input: { id } },
            awaitRefetchQueries: true,
          });

          const taskData = response.data?.copyTask;
          if (taskData?.groupId != null) {
            InboxGroupCacheManager.insertTaskAfterTarget(rest.client.cache, {
              targetTaskId: id,
              clonedTaskId: taskData.id,
            });
            // InboxGroupCacheManager.refetch(rest.client, { inboxId: taskData.groupId });
            // GroupCacheManager.refetchGroup(rest.client, { groupId: taskData.groupId });
            PlannerInitCacheManager.refetch(rest.client);
          }
        } finally {
          setLoading(false);
        }
      });
    },
    [copyTask, promise, rest.client],
  );

  return { copyTask: copyTaskHandler, ...rest, loading: loading || rest.loading };
}

export { useTaskCopyFeature };
