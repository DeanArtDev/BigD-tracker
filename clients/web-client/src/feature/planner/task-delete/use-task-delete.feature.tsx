import { useCallback, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';
import { useConfirmDialog, useNotify } from '@/shared/project-ui';
import { GroupCacheManager, PlannerInitCacheManager, TaskCacheManager, TaskStatus } from '@/shared/transport/graphql';
import { Typography } from '@/shared/ui-kit';
import { useTaskDelete } from './api/use-task-delete';

function useTaskDeleteFeature() {
  const { deleteTask, ...rest } = useTaskDelete();
  const { viaConfirmation } = useConfirmDialog();
  const { promise } = useNotify();

  const [loading, setLoading] = useState(false);

  const deleteTaskHandler = useCallback(
    (
      input: { taskId: TaskId; groupId?: GroupId },
      params?: {
        onCancel?: () => void;
        onError?: (error: unknown) => MaybePromise<void>;
        onSuccess?: () => MaybePromise<void>;
        showToast?: boolean;
        withConfirmation?: boolean;
      },
    ) => {
      viaConfirmation({
        isNeedConfirm: () => params?.withConfirmation ?? true,
        cancel: params?.onCancel,
        callback: () => {
          const { onError, onSuccess, showToast = true } = params ?? {};

          const mutation = async () => {
            try {
              setLoading(true);
              const { taskId, groupId } = input;
              const response = await deleteTask({
                variables: { input: { id: taskId } },
                awaitRefetchQueries: true,
              });

              const id = response.data?.deleteTask?.id;
              if (id == null) throw new Error('Backend did not return the deleted task');

              PlannerInitCacheManager.refetch(rest.client);
              if (groupId != null) {
                GroupCacheManager.removeTaskFromGroup(rest.client.cache, { taskId, groupId });
              }
              TaskCacheManager.removeTask(rest.client.cache, { taskId: id });
              TaskCacheManager.dropGetTasksPerPageByStatuses(rest.client, [TaskStatus.Deleted]);
              await onSuccess?.();
              rest.client.cache.gc();
            } catch (error) {
              await onError?.(error);
              throw error;
            } finally {
              setLoading(false);
            }
          };

          const ranMutation = mutation();
          if (showToast) promise(ranMutation);
          return ranMutation;
        },

        dialog: {
          title: 'Удалить?',
          content: (
            <Typography.Small className="text-sm">
              Дело будет перемещена в «Удалённые». Её будет можно восстановить.
            </Typography.Small>
          ),
        },
      });
    },
    [deleteTask, promise, rest.client, viaConfirmation],
  );

  return { deleteTask: deleteTaskHandler, ...rest, loading: loading || rest.loading };
}

export { useTaskDeleteFeature };
