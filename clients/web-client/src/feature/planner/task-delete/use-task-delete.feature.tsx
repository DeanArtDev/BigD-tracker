import { useCallback, useState } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { MaybePromise } from '@/shared/lib';
import { useConfirmDialog, useNotify } from '@/shared/project-ui';
import { GroupCacheManager, PlannerInitCacheManager, TaskCacheManager } from '@/shared/transport/graphql';
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
      params?: { onSuccess?: () => MaybePromise<void>; showToast?: boolean; onCancel?: () => void },
    ) => {
      viaConfirmation({
        isNeedConfirm: () => true,
        cancel: params?.onCancel,
        callback: async () => {
          const { showToast = true, onSuccess } = params ?? {};

          const mutation = async () => {
            try {
              setLoading(true);
              const { taskId, groupId } = input;
              const response = await deleteTask({
                variables: { input: { id: taskId } },
                awaitRefetchQueries: true,
              });

              if (response.data?.deleteTask != null) {
                const id = response.data?.deleteTask.id;
                if (id == null) return;
                PlannerInitCacheManager.refetch(rest.client);
                if (groupId != null) {
                  GroupCacheManager.removeTaskFromGroup(rest.client.cache, { taskId, groupId });
                }
                TaskCacheManager.removeTask(rest.client.cache, { taskId: id });
                TaskCacheManager.dropDeletedGetTasksPerPage(rest.client);
                await onSuccess?.();
              }
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
