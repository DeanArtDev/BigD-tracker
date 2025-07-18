import { groupsQueryKeys } from '@/entity/planner/groups/model/query';
import { $privetQueryClient } from '@/shared/api/api-client';

function useInboxQuery() {
  const { data, ...others } = $privetQueryClient.useQuery(...groupsQueryKeys.getInbox());

  return {
    inbox: data?.data,
    isEmpty: data?.data == null,
    ...others,
  };
}

export { useInboxQuery };
