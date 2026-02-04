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
    console.log('useInvalidateGroupById');
    return queryClient.invalidateQueries({
      queryKey: groupsQueryKeys.getGroupById(param),
    });
  };
}

export { useInvalidateInbox, useInvalidateGroups, useInvalidateGroupById };
