import { $privetQueryClient } from '@/shared/api/api-client';
import { routes } from '@/shared/lib/routes';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { isExceptionWrongLoginOrPassword } from './errors';
import { useDropEverything } from './invalidators';
import { useAccessTokenStore } from './store/use-access-token-store';
import { useAuthStore } from './store/use-auth-store';

function useLogin() {
  const navigate = useNavigate();
  const drop = useDropEverything();
  const setIsAuth = useAuthStore((state) => state.setIsAuth);
  const setAccessToken = useAccessTokenStore((state) => state.setAccessToken);

  const {
    mutate: login,
    error,
    ...states
  } = $privetQueryClient.useMutation('post', '/auth/login', {
    onSuccess: (data) => {
      if (data.data != null) {
        setAccessToken(data.data.token);
        setIsAuth(true);
        drop();
        navigate(routes.home.path);
      }
    },
  });

  const isWrongPassOrLogin = useMemo(() => isExceptionWrongLoginOrPassword(error), [error]);

  return { login, isWrongPassOrLogin, error, ...states };
}

export { useLogin };
