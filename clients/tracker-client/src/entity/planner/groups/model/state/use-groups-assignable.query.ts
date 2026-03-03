import { $privetQueryClient } from '@/shared/api/api-client';
import type { GroupInfoEntity } from '../group-info.entity';
import { groupsQueryKeys } from './query';

function useGroupsAssignableQuery() {
  const { data, ...others } = $privetQueryClient.useQuery(...groupsQueryKeys.getGroupsAssignable(), undefined, {
    select: (data): GroupInfoEntity[] =>
      data?.data.map((group) => ({
        ...group,
        name: group.name === 'IN_BOX' ? 'Inbox' : group.name,
      })),
  });

  return {
    infoGroups: data,
    isEmpty: data == null || data.length === 0,
    ...others,
  };
}

export { useGroupsAssignableQuery };
