import { useCallback, useState } from 'react';
import { TaskId } from '@/entity/planner/tasks';
import { useTaskFinish } from '@/entity/planner/tasks/model';
import { TaskFinishStatus } from '@/entity/schema-types';
import { TaskFinishDialog } from '@/feature/planner/task-finish/task-finish-dialog';
import { useNotify } from '@/shared/lib';

function useTaskFinishFeature() {
  const { finishTask, ...rest } = useTaskFinish();
  const { promise } = useNotify();
  const [taskFinishData, setTaskFinishData] = useState<{ taskId: TaskId }>();

  const finishTaskMutation = useCallback(
    (data: { id: TaskId; reason?: string; status: TaskFinishStatus }) => {
      const { id, reason, status } = data;

      promise(async () =>
        finishTask({
          variables: { input: { id, reason, type: status } },
          onCompleted: () => {
            setTaskFinishData(undefined);
          },
        }),
      );
    },
    [finishTask, promise],
  );

  const taskFinishDialogHolder = (
    <TaskFinishDialog
      loading={rest.loading}
      taskId={taskFinishData?.taskId}
      open={taskFinishData != null}
      onFinish={(data) => {
        if (taskFinishData == null) return;
        finishTaskMutation({ id: taskFinishData?.taskId, ...data });
      }}
      onOpenChange={(value) => {
        if (!value) setTaskFinishData(undefined);
      }}
    />
  );

  const finishTaskHandler = (id: TaskId) => {
    setTaskFinishData({ taskId: id });
  };

  return { finishTask: finishTaskHandler, ...rest, taskFinishDialogHolder };
}

export { useTaskFinishFeature };
