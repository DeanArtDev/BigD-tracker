import { useCallback } from 'react';
import { GroupId, useGroupUpdate } from '@/entity/planner/groups/model';
import { useNotify } from '@/shared/lib';

function useGroupUpdateFeature() {
  const { updateGroup, loading: isGroupUpdateLoading } = useGroupUpdate();
  const { promise } = useNotify();

  const handleGroupUpdate = useCallback(
    (input: { name: string; id: GroupId; description?: string }) => {
      promise(
        updateGroup({
          variables: { input: { id: input.id, name: input.name, description: input.description } },
        }),
      );
    },
    [promise, updateGroup],
  );

  return { updateGroup: handleGroupUpdate, isGroupUpdateLoading };
}

export { useGroupUpdateFeature };
