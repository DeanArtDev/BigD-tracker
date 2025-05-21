import { useMemo } from 'react';
import { $privetQueryClient } from '@/shared/api/api-client';
import { isExceptionWrongLoginOrPassword } from '@big-d/api-exception';
import { useAuthStore } from './use-auth-store';
import { useAccessTokenStore } from './use-access-token-store';

function useLogin() {
  const setIsAuth = useAuthStore((state) => state.setIsAuth);
  const setAccessToken = useAccessTokenStore((state) => state.setAccessToken);

  const {
    mutate: login,
    error,
    ...states
  } = $privetQueryClient.useMutation('post', '/auth/login', {
    onSuccess: (data) => {
      if (data.data != null) {
        console.log(data.data.token);
        setAccessToken(data.data.token);
        setIsAuth(true);
      }
    },
  });

  const isWrongPassOrLogin = useMemo(
    () => isExceptionWrongLoginOrPassword(error),
    [error],
  );

  return { login, isWrongPassOrLogin, ...states };
}

export { useLogin };
