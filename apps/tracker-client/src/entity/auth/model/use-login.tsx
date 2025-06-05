import { useMemo } from 'react';
import { $privetQueryClient } from '@/shared/api/api-client';
import { isExceptionWrongLoginOrPassword } from '@big-d/api-exception';
import { useAuthStore } from './use-auth-store';
import { useAccessTokenStore } from './use-access-token-store';
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
        navigate(routes.gymHome.path);
      }
    },
  });

  const isWrongPassOrLogin = useMemo(() => isExceptionWrongLoginOrPassword(error), [error]);

  return { login, isWrongPassOrLogin, error, ...states };
}

export { useLogin };
