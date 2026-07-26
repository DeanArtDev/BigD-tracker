import { useCallback, useState } from 'react';
import { TaskId, useTaskDelete } from '@/entity/planner/tasks';
import { useNotify } from '@/shared/lib';
import { useConfirmDialog } from '@/shared/project-ui';
import { PlannerInitCacheManager, TaskCacheManager } from '@/shared/transport/graphql';
import { Typography } from '@/shared/ui-kit';

function useTaskDeleteFeature() {
  const { deleteTask, ...rest } = useTaskDelete();
  const { viaConfirmation } = useConfirmDialog();
  const { promise } = useNotify();

  const [loading, setLoading] = useState(false);

  const deleteTaskHandler = useCallback(
    (id: TaskId) => {
      viaConfirmation({
        isNeedConfirm: () => true,

        callback: async () => {
          promise(async () => {
            try {
              setLoading(true);
              const response = await deleteTask({
                variables: { input: { id } },
                awaitRefetchQueries: true,
              });

              if (response.data?.deleteTask != null) {
                const id = response.data?.deleteTask.id;
                if (id == null) return;
                PlannerInitCacheManager.refetch(rest.client);
                TaskCacheManager.removeTask(rest.client.cache, { taskId: id });
              }
            } finally {
              setLoading(false);
            }
          });
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
