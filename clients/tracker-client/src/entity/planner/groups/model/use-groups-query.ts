import { groupsQueryKeys } from '@/entity/planner/groups/model/query';
import { $privetQueryClient } from '@/shared/api/api-client';

function useGroupsQuery() {
  const { data, ...others } = $privetQueryClient.useQuery(...groupsQueryKeys.getGroups());

  return {
    groups: data?.data,
    isEmpty: data?.data == null,
    ...others,
  };
}

export { useGroupsQuery };
