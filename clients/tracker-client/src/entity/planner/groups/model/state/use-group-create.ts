import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useGroupCreate() {
  const options = getDefaultQueryNotifications();
  const { mutate: createGroup, ...others } = $privetQueryClient.useMutation('post', '/groups', {
    onError: options.onError,
  });

  return {
    createGroup,
    ...others,
  };
}

export { useGroupCreate };
