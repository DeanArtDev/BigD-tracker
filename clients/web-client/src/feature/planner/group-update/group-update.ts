import { useCallback } from 'react';
import { GroupId } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { useNotify } from '@/shared/lib';
import { GroupCacheManager } from '@/shared/transport/graphql';
import { useGroupUpdate } from './api/use-group-update';

type GroupUpdateHandlerParams = {
  readonly id: GroupId;
  readonly name: string;
  readonly description: string | undefined | null;
  readonly taskIds: { readonly id: TaskId }[] | undefined;
};

function useGroupUpdateFeature(options: { showToast?: boolean } = { showToast: true }) {
  const { showToast } = options;

  const { updateGroup, client, loading: isGroupUpdateLoading } = useGroupUpdate();
  const { promise } = useNotify();

  const handleGroupUpdate = useCallback(
    (input: GroupUpdateHandlerParams) => {
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
