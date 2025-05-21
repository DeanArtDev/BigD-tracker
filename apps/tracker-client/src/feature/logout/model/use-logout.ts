import { $privetQueryClient } from '@/shared/api/api-client';
import { useAccessTokenStore, useAuthStore } from '@/entity/auth';

function useLogout() {
  const setAccessToken = useAccessTokenStore((state) => state.setAccessToken);
  const setIsAuth = useAuthStore((state) => state.setIsAuth);
  const { mutate, ...others } = $privetQueryClient.useMutation('post', '/auth/logout', {
    retry: 2,
  });

  const logout = () => {
    mutate(
      {},
      {
        onSuccess: () => {
          setIsAuth(false);
          setAccessToken(undefined);
        },
      },
    );
  };

  return {
    logout,
    ...others,
  };
}

export { useLogout };
