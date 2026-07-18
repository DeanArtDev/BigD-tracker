import { useCallback } from 'react';
import { GroupId, invalidateGroup, useGroupDelete } from '@/entity/planner/groups';
import { GroupTaskCount } from '@/feature/planner/group-delete/group-task-count';
import { useNotify } from '@/shared/lib';
import { useConfirmDialog } from '@/shared/project-ui';
import { Typography } from '@/shared/ui-kit';

function useGroupDeleteFeature() {
  const { deleteGroup, client, loading: isGroupDeleteLoading } = useGroupDelete();
  const { viaConfirmation } = useConfirmDialog();
  const { promise } = useNotify();

  const handleGroupDelete = useCallback(
    (id: GroupId) => {
      viaConfirmation({
        dialog: {
          title: 'Удалить?',
          content: (
            <span className="flex flex-col gap-2">
              <GroupTaskCount groupId={id} />
              <span>Дела это группы не удалятся, но группа удаляется навсегда</span>
            </span>
          ),
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
