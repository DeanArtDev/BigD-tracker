import { useCallback, useState } from 'react';
import { TaskId } from '@/entity/planner/tasks';
import { useNotify } from '@/shared/project-ui';
import {
  GroupCacheManager,
  InboxGroupCacheManager,
  PlannerInitCacheManager,
  TaskCacheManager,
} from '@/shared/transport/graphql';
import { useTaskCopy } from './api/use-task-copy';

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
          if (taskData == null) return;

          TaskCacheManager.insertTaskAfterTargetIntoTasksPerPage(rest.client.cache, {
            targetTaskId: id,
            clonedTaskId: taskData.id,
          });

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
            TaskCacheManager.refetchAssignableTasks(rest.client);
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
