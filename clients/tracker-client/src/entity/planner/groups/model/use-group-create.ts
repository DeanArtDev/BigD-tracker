import { $privetQueryClient } from '@/shared/api/api-client';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useGroupCreate() {
  const options = getDefaultQueryNotifications();
  const { mutate: create, ...others } = $privetQueryClient.useMutation('post', '/groups', options);

  return {
    create,
    ...others,
  };
}

export { useGroupCreate };
