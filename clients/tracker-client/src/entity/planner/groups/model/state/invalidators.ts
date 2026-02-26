import { useQueryClient } from '@tanstack/react-query';
import { groupsQueryKeys } from './query';

function useInvalidateInbox() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      queryKey: groupsQueryKeys.getInbox(),
    });
}

function useInvalidateGroupById() {
  const queryClient = useQueryClient();

  return (param: { groupId: number }) => {
    return queryClient.invalidateQueries({
      queryKey: groupsQueryKeys.getGroupById(param),
    });
  };
}

function useInvalidateAllGroups() {
  const queryClient = useQueryClient();

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

export { useInvalidateInbox, useInvalidateGroupById, useInvalidateAllGroups };
