import { $privetQueryClient } from '@/shared/api/api-client';
import { queryClient } from '@/shared/api/query-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';
import { groupsQueryKeys } from './query';

function useGroupDelete() {
  const options = getDefaultQueryNotifications();
  const { mutate: deleteGroup, ...others } = $privetQueryClient.useMutation(
    'delete',
    '/groups/{groupId}',
    {
      onError: options.onError,
      onSuccess: async (_, { params }) => {
        queryClient.setQueriesData(
          {
            queryKey: groupsQueryKeys.getGroupById({ groupId: params.path.groupId }),
          },
          null,
        );
      },
    },
  );

  return {
    deleteGroup,
    ...others,
  };
}

export { useGroupDelete };
