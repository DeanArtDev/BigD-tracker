import { useCallback, useState } from 'react';
import { TaskId } from '@/entity/planner/tasks';
import { useNotify } from '@/shared/project-ui';
import {
  GroupCacheManager,
  InboxGroupCacheManager,
  PlannerInitCacheManager,
  TaskCacheManager,
} from '@/shared/transport/graphql';
import { useTaskClone } from './api/use-task-clone';

function useTaskCloneFeature() {
  const { cloneTask, ...rest } = useTaskClone();
  const { promise } = useNotify();

  const [loading, setLoading] = useState(false);

  const cloneTaskHandler = useCallback(
    (id: TaskId) => {
      promise(async () => {
        try {
          setLoading(true);
          const response = await cloneTask({
            variables: { input: { id } },
            awaitRefetchQueries: true,
          });

          const taskData = response.data?.cloneTask;
          if (taskData == null) return;

          TaskCacheManager.insertTaskAfterTargetIntoTasksPerPage(rest.client.cache, {
            targetTaskId: id,
            clonedTaskId: taskData.id,
          });
          TaskCacheManager.refetchAssignableTasks(rest.client);
          TaskCacheManager.dropCurrentGetTasksPerPage(rest.client);

          if (taskData.groupId != null) {
            PlannerInitCacheManager.refetch(rest.client);
            InboxGroupCacheManager.insertTaskAfterTarget(rest.client.cache, {
              targetTaskId: id,
              clonedTaskId: taskData.id,
            });
            GroupCacheManager.insertTaskAfterTarget(rest.client.cache, {
              targetTaskId: id,
              clonedTaskId: taskData.id,
              groupId: taskData.groupId,
            });
          }

          rest.client.cache.gc();
        } finally {
          setLoading(false);
        }
      });
    },
    [cloneTask, promise, rest.client],
  );

  return { cloneTask: cloneTaskHandler, ...rest, loading: loading || rest.loading };
}

export { useTaskCloneFeature };
