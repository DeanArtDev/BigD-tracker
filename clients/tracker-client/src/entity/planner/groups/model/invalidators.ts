import { groupsQueryKeys } from '@/entity/planner/groups/model/query';
import { queryClient } from '@/shared/api/query-client';

function useInvalidateInbox() {
  return () =>
    queryClient.invalidateQueries({
      queryKey: groupsQueryKeys.getInbox(),
    });
}

function useGroupInvalidate() {
  return () =>
    queryClient.invalidateQueries({
      queryKey: groupsQueryKeys.getGroups(),
    });
}

export { useInvalidateInbox, useGroupInvalidate };
