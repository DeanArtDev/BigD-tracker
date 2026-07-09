import { useCallback, useState } from 'react';
import { invalidatePlannerInit } from '@/entity/planner/init';
import { TaskId, useTaskDelete } from '@/entity/planner/tasks';
import { TaskSchema } from '@/entity/schema-types';
import { useNotify } from '@/shared/lib';
import { useConfirmDialog } from '@/shared/project-ui';
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
            setLoading(true);
            const response = await deleteTask({
              variables: { input: { id } },
              awaitRefetchQueries: true,
            });

            if (response.data?.deleteTask != null) {
              const id = response.data?.deleteTask.id;
              if (id == null) return;
              await invalidatePlannerInit(rest.client.cache);
              const __typename: TaskSchema['__typename'] = 'TaskSchema';
              rest.client.cache.evict({ id: rest.client.cache.identify({ __typename, id }) });
            }
            setLoading(false);
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
    [deleteTask, promise, rest.client.cache, viaConfirmation],
  );

  return { deleteTask: deleteTaskHandler, ...rest, loading: loading || rest.loading };
}

export { useTaskDeleteFeature };
