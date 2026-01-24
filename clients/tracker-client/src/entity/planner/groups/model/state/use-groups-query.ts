import { $privetQueryClient } from '@/shared/api/api-client';
import { groupsQueryKeys } from './query';

function useGroupsQuery() {
  const { data, ...others } = $privetQueryClient.useQuery(...groupsQueryKeys.getGroups());

  return {
    groups: data?.data,
    isEmpty: data?.data == null,
    ...others,
  };
}

export { useGroupsQuery };
