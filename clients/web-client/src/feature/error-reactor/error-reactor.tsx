'use client';

import { useApolloClient } from '@apollo/client/react';
import { exceptionCode } from '@big-d/exceptions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useNotify } from '@/shared/lib';
import { routes } from '@/shared/routes';
import { useReactorStore } from './store';
import { useNetworkReactor } from './use-network-reactor';

function ErrorReactor() {
  useNetworkReactor();

  const router = useRouter();
  const apolloClient = useApolloClient();
  const notify = useNotify();

  const error = useReactorStore((s) => s.error);
  const clear = useReactorStore((s) => s.clear);

  useEffect(() => {
    if (error == null) return;
    if (error.code === exceptionCode.accountUnauthorized.code) {
      apolloClient.clearStore().then(() => void router.replace(routes.login.path));
      return;
    }
    if (error.code === exceptionCode.requestTimeout.code) {
      notify.error({ message: 'Превышен таймаут запроса, попробуйте позже', onDismiss: () => void clear() });
    }

    return () => void apolloClient.clearStore().then(() => void clear());
  }, [apolloClient, clear, error, notify, router]);

  return null;
}

export { ErrorReactor };
