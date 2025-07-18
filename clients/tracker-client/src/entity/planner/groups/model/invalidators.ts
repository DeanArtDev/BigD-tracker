import { groupsQueryKeys } from '@/entity/planner/groups/model/query';
import { queryClient } from '@/shared/api/query-client';

function useInvalidateInbox() {
  return () =>
    queryClient.invalidateQueries({
      queryKey: groupsQueryKeys.getInbox(),
    });
}

export { useInvalidateInbox };
