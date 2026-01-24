import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useGroupDelete() {
  const options = getDefaultQueryNotifications();
  const { mutate: deleteGroup, ...others } = $privetQueryClient.useMutation(
    'delete',
    '/groups/{groupId}',
    options,
  );

  return {
    deleteGroup,
    ...others,
  };
}

export { useGroupDelete };
