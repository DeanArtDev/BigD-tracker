import { useCallback, useState } from 'react';
import { invalidateInboxTasks } from '@/entity/planner/inbox';
import { invalidatePlannerInit, usePlannerInit } from '@/entity/planner/init';
import { TaskId } from '@/entity/planner/tasks';
import { useTaskCopy } from '@/entity/planner/tasks/model';
import { useNotify } from '@/shared/lib';

function useTaskCopyFeature() {
  const { copyTask, ...rest } = useTaskCopy();
  const { data } = usePlannerInit();
  const { promise } = useNotify();

  const [loading, setLoading] = useState(false);

  const copyTaskHandler = useCallback(
    (id: TaskId) => {
      if (data.inbox.id == null) return;

      promise(async () => {
        setLoading(true);
        const response = await copyTask({
          variables: { input: { id } },
          awaitRefetchQueries: true,
        });

        if (response.data?.copyTask != null) {
          const id = response.data?.copyTask.id;
          if (id == null || data.inbox.id == null) return;
          await invalidateInboxTasks(rest.client, data.inbox.id);
          await invalidatePlannerInit(rest.client.cache);
        }
        setLoading(false);
      });
    },
    [copyTask, data.inbox.id, promise, rest.client],
  );

  return { copyTask: copyTaskHandler, ...rest, loading: loading || rest.loading };
}

export { useTaskCopyFeature };
