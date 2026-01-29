import { taskDtoToInfoEntity } from '@/entity/planner/tasks';
import { $privetQueryClient } from '@/shared/api/api-client';
import type { GroupEntity } from '../group.entity';
import { groupsQueryKeys } from './query';

function useGroupsQuery() {
  const { data, ...others } = $privetQueryClient.useQuery(
    ...groupsQueryKeys.getGroups(),
    undefined,
    {
      select: (data): GroupEntity[] => {
        return (data?.data ?? []).map<GroupEntity>((group) => ({
          id: group.id,
          name: group.name,
          description: group.description,
          status: group.status,
          progress: group.progress,
          tasks: group.tasks.map(taskDtoToInfoEntity),
        }));
      },
    },
  );

  return {
    groups: data,
    isEmpty: data == null || data?.length <= 0,
    ...others,
  };
}

export { useGroupsQuery };
