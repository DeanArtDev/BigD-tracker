import { useCallback } from 'react';
import { GroupCacheManager, GroupId, useGroupUpdate } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { useNotify } from '@/shared/lib';

function useGroupUpdateFeature(options: { showToast?: boolean } = { showToast: true }) {
  const { showToast } = options;

  const { updateGroup, client, loading: isGroupUpdateLoading } = useGroupUpdate();
  const { promise } = useNotify();

  const handleGroupUpdate = useCallback(
    (input: { name: string; id: GroupId; description: string | undefined | null; taskIds?: { id: TaskId }[] }) => {
      const mutation = async () => {
        const result = await updateGroup({
          variables: {
            input: { id: input.id, name: input.name, description: input.description, tasks: input.taskIds },
          },
        });

        if (result.data?.updateGroup != null) {
          GroupCacheManager.updateGroupInfo(client.cache, {
            groupId: input.id,
            name: result.data.updateGroup.name,
          });
        }

        return result;
      };

      if (showToast) return promise(mutation, { success: 'Группа обновлена', duration: 500 });
      else return mutation();
    },
    [client.cache, promise, showToast, updateGroup],
  );

  return { updateGroup: handleGroupUpdate, isGroupUpdateLoading };
}

export { useGroupUpdateFeature };
