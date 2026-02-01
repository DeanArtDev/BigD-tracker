import { taskDtoToEntity } from '@/entity/planner/tasks';
import { $privetQueryClient } from '@/shared/api/api-client';
import { keyBy } from 'lodash-es';
import type { GroupEntity } from '../group.entity';
import { groupsQueryKeys } from './query';

interface GroupsQueryResponse {
  readonly items: GroupEntity[];
  readonly byId: Record<number, GroupEntity>;
}

function useGroupsQuery() {
  const { data, ...others } = $privetQueryClient.useQuery(
    ...groupsQueryKeys.getGroups(),
    undefined,
    {
      select: (data): GroupsQueryResponse => {
        const items = (data?.data ?? []).map<GroupEntity>((group) => {
          return {
            id: group.id,
            name: group.name,
            description: group.description,
            status: group.status,
            progress: group.progress,
            tasks: group.tasks.map(taskDtoToEntity),
          };
        });

        return { items, byId: keyBy(items, 'id') };
      },
    },
  );

  return {
    groups: data,
    isEmpty: data == null || data?.items.length <= 0,
    ...others,
  };
}

export { useGroupsQuery };
