import { useCallback } from 'react';
import { GroupId, useGroupUpdate } from '@/entity/planner/groups';
import { TaskId } from '@/entity/planner/tasks';
import { useNotify } from '@/shared/lib';

function useGroupUpdateFeature() {
  const { updateGroup, loading: isGroupUpdateLoading } = useGroupUpdate();
  const { promise } = useNotify();

  const handleGroupUpdate = useCallback(
    (input: { name: string; id: GroupId; description: string | undefined | null; taskIds?: { id: TaskId }[] }) => {
      promise(
        updateGroup({
          variables: {
            input: { id: input.id, name: input.name, description: input.description, tasks: input.taskIds },
          },
        }),
        { success: 'Группа обновлена', duration: 500 },
      );
    },
    [promise, updateGroup],
  );

  return { updateGroup: handleGroupUpdate, isGroupUpdateLoading };
}

export { useGroupUpdateFeature };
