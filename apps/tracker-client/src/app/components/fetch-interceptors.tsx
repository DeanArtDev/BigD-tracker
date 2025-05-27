import { useEffect, useRef } from 'react';
import { apiPrivateClient } from '@/shared/api/api-client';
import { refreshToken, setIsAuth, useAccessTokenStore } from '@/entity/auth';
import { isExceptionUnauthorized } from '@big-d/api-exception';

function FetchInterceptors({ children }: React.PropsWithChildren) {
  const isCalled = useRef(false);

  useEffect(() => {
    if (isCalled.current) return;

    apiPrivateClient.use({
      async onRequest({ request }) {
        const { accessToken } = useAccessTokenStore.getState();
        if (accessToken != null) {
          request.headers.set('Authorization', `Bearer ${accessToken}`);
        }
      },

      async onResponse({ response }) {
        if (response.status !== 401) return undefined;
        const clone = response.clone();
        const result = await clone.json();
        if (isExceptionUnauthorized(result)) {
          const newToken = await refreshToken();
          setIsAuth(Boolean(newToken));
        }
      },
    });

    isCalled.current = true;
  }, []);

  return children;
}

export { FetchInterceptors };
