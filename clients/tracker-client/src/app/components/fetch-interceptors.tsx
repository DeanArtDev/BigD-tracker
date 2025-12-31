import { refreshToken, setIsAuth, useAccessTokenStore } from '@/entity/auth';
import { isExceptionUnauthorized } from '@/entity/auth/model/errors';
import { apiPrivateClient } from '@/shared/api/api-client';
import { useEffect, useRef, useState } from 'react';

function FetchInterceptors({ children }: React.PropsWithChildren) {
  const isCalled = useRef(false);
  const [isInterceptors, setIsInterceptors] = useState(false);

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
    setIsInterceptors(true);
  }, []);

  if (!isInterceptors) return null;
  return children;
}

export { FetchInterceptors };
