import { groupsQueryKeys } from './query';
import { queryClient } from '@/shared/api/query-client';

function useInvalidateInbox() {
  return () =>
    queryClient.invalidateQueries({
      queryKey: groupsQueryKeys.getInbox(),
    });
}

function useInvalidateGroups() {
  return () =>
    queryClient.invalidateQueries({
      queryKey: groupsQueryKeys.getGroups(),
    });
}

function useInvalidateGroupById() {
  return (param: { groupId: number }) => {
    return queryClient.invalidateQueries({
      queryKey: groupsQueryKeys.getGroupById(param),
    });
  };
}

function useInvalidateAllGroups() {
  return () => {
    return queryClient.invalidateQueries({
      predicate: (query) => {
        if (Array.isArray(query.queryKey)) {
          const endpoint = query.queryKey[1];
          const mainEndpointStart = groupsQueryKeys.mainKey[1];
          return endpoint?.startsWith(mainEndpointStart);
        }
        return undefined;
      },
    });
  };
}

export { useInvalidateInbox, useInvalidateGroups, useInvalidateGroupById, useInvalidateAllGroups };
