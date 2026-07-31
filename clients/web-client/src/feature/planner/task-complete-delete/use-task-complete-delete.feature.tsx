import { useCallback, useState } from 'react';
import { TaskId } from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';
import { useConfirmDialog, useNotify } from '@/shared/project-ui';
import { TaskCacheManager } from '@/shared/transport/graphql';
import { Typography } from '@/shared/ui-kit';
import { useTaskCompleteDelete } from './api/use-task-complete-delete';

function useTaskCompleteDeleteFeature() {
  const { completeDeleteTask, ...rest } = useTaskCompleteDelete();
  const { viaConfirmation } = useConfirmDialog();
  const { promise } = useNotify();

  const [loading, setLoading] = useState(false);

  const completeDeleteTaskHandler = useCallback(
    (taskId: TaskId, params?: { onSuccess?: () => MaybePromise<void>; showToast?: boolean; onCancel?: () => void }) => {
      viaConfirmation({
        isNeedConfirm: () => true,
        cancel: params?.onCancel,
        callback: async () => {
          const { showToast = true, onSuccess } = params ?? {};

          const mutation = async () => {
            try {
              setLoading(true);
              const response = await completeDeleteTask({
                variables: { input: { id: taskId } },
              });

              if (response.data?.completeDeleteTask == null) return;

              TaskCacheManager.removeTask(rest.client.cache, { taskId });

              await onSuccess?.();
              rest.client.cache.gc();
            } finally {
              setLoading(false);
            }
          };

          const ranMutation = mutation();
          if (showToast) promise(ranMutation);
          return ranMutation;
        },

        dialog: {
          title: 'Удалить полностью?',
          content: (
            <Typography.Small className="text-sm">
              Это окончательное удаление. Восстановить дело после него будет нельзя.
            </Typography.Small>
          ),
        },
      });
    },
    [completeDeleteTask, promise, rest.client, viaConfirmation],
  );

  return {
    completeDeleteTask: completeDeleteTaskHandler,
    ...rest,
    loading: loading || rest.loading,
  };
}

export { useTaskCompleteDeleteFeature };
