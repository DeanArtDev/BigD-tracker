import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useGroupUpdate() {
  const options = getDefaultQueryNotifications();
  const { mutate: updateGroup, ...others } = $privetQueryClient.useMutation(
    'put',
    '/groups/{groupId}',
    options,
  );

  return {
    updateGroup,
    ...others,
  };
}

export { useGroupUpdate };
