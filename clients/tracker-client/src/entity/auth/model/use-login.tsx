import { useMemo } from 'react';
import { $privetQueryClient } from '@/shared/api/api-client';
import { isExceptionWrongLoginOrPasswordBody } from '@big-d/api-exceptions';
import { useAuthStore } from './store/use-auth-store';
import { useAccessTokenStore } from './store/use-access-token-store';
import { routes } from '@/shared/lib/routes';
import { useNavigate } from 'react-router-dom';
import { getDefaultQueryNotifications } from '@/shared/lib/react/default-notifications';

function useLogin() {
  const { onError } = getDefaultQueryNotifications();
  const navigate = useNavigate();
  const setIsAuth = useAuthStore((state) => state.setIsAuth);
  const setAccessToken = useAccessTokenStore((state) => state.setAccessToken);

  const {
    mutate: login,
    error,
    ...states
  } = $privetQueryClient.useMutation('post', '/auth/login', {
    onError: () => {
      onError();
    },
    onSuccess: (data) => {
      if (data.data != null) {
        setAccessToken(data.data.token);
        setIsAuth(true);
        navigate(routes.home.path);
      }
    },
  });

  const isWrongPassOrLogin = useMemo(() => isExceptionWrongLoginOrPasswordBody(error), [error]);

  return { login, isWrongPassOrLogin, error, ...states };
}

export { useLogin };
