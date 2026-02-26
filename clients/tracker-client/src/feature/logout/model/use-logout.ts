import { useDropEverything } from '@/entity/auth';
import { $privetQueryClient } from '@/shared/api/api-client';

function useLogout() {
  const drop = useDropEverything();
  const { mutate: logout, ...others } = $privetQueryClient.useMutation('post', '/auth/logout', {
    retry: 2,
    onSuccess: drop,
  });

  return {
    logout,
    ...others,
  };
}

export { useLogout };
