import { useCallback } from 'react';
import { invalidatePlannerInit } from '@/entity/planner/init';
import { TaskId, useTaskDelete } from '@/entity/planner/tasks';
import { TaskSchema } from '@/entity/schema-types';
import { useConfirmDialog } from '@/shared/project-ui';

function useTaskDeleteFeature() {
  const { deleteTask, ...rest } = useTaskDelete();
  const { viaConfirmation } = useConfirmDialog();

  const deleteTaskHandler = useCallback(
    (id: TaskId) => {
      viaConfirmation({
        isNeedConfirm: () => true,

        callback: async () => {
          await deleteTask({
            variables: { input: { id } },

            async update(cache, { data }) {
              const id = data?.deleteTask.id;
              if (id == null) return;
              await invalidatePlannerInit(cache);
              const __typename: TaskSchema['__typename'] = 'TaskSchema';
              cache.evict({ id: cache.identify({ __typename, id }) });
            },
          });
        },

        dialog: {
          title: 'Удалить?',
          content: 'Можно восстановить',
        },
      });
    },
    [deleteTask, viaConfirmation],
  );

  return { deleteTask: deleteTaskHandler, ...rest };
}

export { useTaskDeleteFeature };
