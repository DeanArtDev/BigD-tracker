import { useCallback, useState } from 'react';
import { currentTasksStatuses, TaskId } from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';
import { useNotify } from '@/shared/project-ui';
import { InboxGroupCacheManager, TaskCacheManager, TaskFinishStatus } from '@/shared/transport/graphql';
import { useTaskFinish } from './api/use-task-finish';
import { TaskFinishDialog } from './task-finish-dialog';

function useTaskFinishFeature() {
  const { finishTask, client, ...rest } = useTaskFinish();
  const { promise } = useNotify();
  const [taskFinishData, setTaskFinishData] = useState<{ taskId: TaskId; onSuccess?: () => MaybePromise<void> }>();

  const finishTaskMutation = useCallback(
    async (
      data: { id: TaskId; reason?: string; status: TaskFinishStatus },
      options?: { onSuccess?: () => MaybePromise<void> },
    ) => {
      const { id, reason, status } = data;

      const mutation = async () => {
        const response = await finishTask({
          variables: { input: { id, reason, type: status } },
          awaitRefetchQueries: true,
        });

        if (response.data !== null) {
          setTaskFinishData(undefined);
          TaskCacheManager.dropGetTasksPerPageByStatuses(client, currentTasksStatuses);
          InboxGroupCacheManager.refetch(client);
          await options?.onSuccess?.();
          client.cache.gc();
        }
      };

      const ranMutation = mutation();
      promise(ranMutation);
      return ranMutation;
    },
    [promise, finishTask, client],
  );

  const taskFinishDialogHolder = (
    <TaskFinishDialog
      loading={rest.loading}
      taskId={taskFinishData?.taskId}
      open={taskFinishData != null}
      onFinish={async (data) => {
        if (taskFinishData == null) return;
        await finishTaskMutation({ id: taskFinishData?.taskId, ...data }, { onSuccess: taskFinishData.onSuccess });
      }}
      onOpenChange={(value) => {
        if (!value) setTaskFinishData(undefined);
      }}
    />
  );

  const finishTaskHandler = (id: TaskId, onSuccess?: () => MaybePromise<void>) => {
    setTaskFinishData({ taskId: id, onSuccess });
  };

  return { finishTask: finishTaskHandler, ...rest, taskFinishDialogHolder };
}

export { useTaskFinishFeature };
