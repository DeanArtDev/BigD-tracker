import { $privetQueryClient } from '@/shared/api/api-client';
import { useAccessTokenStore, useAuthStore } from '@/entity/auth';
import { routes } from '@/shared/lib/routes';
import { useNavigate } from 'react-router-dom';

function useLogout() {
  const navigate = useNavigate();
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
          navigate(routes.login.path);
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
