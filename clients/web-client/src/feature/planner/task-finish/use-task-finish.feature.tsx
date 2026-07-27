import { useCallback, useState } from 'react';
import { TaskId } from '@/entity/planner/tasks';
import { TaskFinishDialog } from '@/feature/planner/task-finish/task-finish-dialog';
import { MaybePromise } from '@/shared/lib';
import { useNotify } from '@/shared/project-ui';
import { TaskFinishStatus } from '@/shared/transport/graphql';
import { useTaskFinish } from './api/use-task-finish';

function useTaskFinishFeature() {
  const { finishTask, ...rest } = useTaskFinish();
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
          await options?.onSuccess?.();
        }
      };

      const ranMutation = mutation();
      promise(ranMutation);
      return ranMutation;
    },
    [finishTask, promise],
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
