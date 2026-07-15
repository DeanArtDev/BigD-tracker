import { useCallback } from 'react';
import { GroupId, useGroupDelete } from '@/entity/planner/groups/model';
import { invalidateGroup } from '@/entity/planner/inbox';
import { useNotify } from '@/shared/lib';
import { useConfirmDialog } from '@/shared/project-ui';

function useGroupDeleteFeature() {
  const { deleteGroup, client, loading: isGroupDeleteLoading } = useGroupDelete();
  const { viaConfirmation } = useConfirmDialog();
  const { promise } = useNotify();

  const handleGroupDelete = useCallback(
    (id: GroupId) => {
      viaConfirmation({
        dialog: {
          title: 'Удалить?',
          content: 'Восстановить группу будет нельзя.',
        },
        isNeedConfirm: () => true,
        callback: async () => {
          promise(
            deleteGroup({
              variables: { input: { groupId: id } },

              onCompleted: async ({ groupDelete: ok }) => {
                if (ok) {
                  await invalidateGroup(client.cache, id);
                }
              },
            }),
          );
        },
      });
    },
    [client.cache, deleteGroup, promise, viaConfirmation],
  );

  return { deleteGroup: handleGroupDelete, isGroupDeleteLoading };
}

export { useGroupDeleteFeature };
