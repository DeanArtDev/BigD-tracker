import { useCallback } from 'react';
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

            update(cache, { data }) {
              const id = data?.deleteTask.id;
              if (id == null) return;
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
