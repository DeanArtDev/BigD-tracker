'use client';

import { useApolloClient } from '@apollo/client/react';
import { exceptionCode } from '@big-d/exceptions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { routes } from '@/shared/routes';
import { toastConfig } from './config';
import { useReactorStore } from './store';
import { useNetworkReactor } from './use-network-reactor';

function ErrorReactor() {
  useNetworkReactor();

  const router = useRouter();
  const apolloClient = useApolloClient();

  const error = useReactorStore((s) => s.error);
  const clear = useReactorStore((s) => s.clear);

  useEffect(() => {
    if (error == null) return;
    if (error.code === exceptionCode.accountUnauthorized.code) {
      apolloClient.clearStore().then(() => void router.replace(routes.login.path));
      return;
    }
    if (error.code === exceptionCode.requestTimeout.code) {
      return void toast.error('Превышен таймаут запроса, попробуйте позже', toastConfig);
    }

    return () => void apolloClient.clearStore().then(() => void clear());
  }, [apolloClient, clear, error, router]);

  return null;
}

export { ErrorReactor };
