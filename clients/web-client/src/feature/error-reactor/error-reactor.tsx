'use client';

import { useApolloClient } from '@apollo/client/react';
import { exceptionCode } from '@big-d/exceptions';
import { Wifi } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ExternalToast, toast } from 'sonner';
import { useOnlineStatus } from '@/shared/lib/application-status';
import { routes } from '@/shared/routes';
import { useReactorStore } from './store';

const toastConfig: ExternalToast = {
  closeButton: true,
  position: 'top-center',
};

function ErrorReactor() {
  const isOnline = useOnlineStatus();
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

    return clear;
  }, [apolloClient, clear, error, router]);

  const firstNotify = useRef(false);
  const toastId = useRef<string | number | undefined>(undefined);
  useEffect(() => {
    if (isOnline && firstNotify.current) {
      toast.dismiss(toastId.current);
      toastId.current = toast.success('Интернет соединение восстановлено!', {
        ...toastConfig,
        icon: <Wifi />,
        style: {
          gap: 14,
        },
      });
    }

    if (!isOnline && !firstNotify.current) {
      firstNotify.current = true;
      toast.dismiss(toastId.current);
      toastId.current = toast.error('Интернет соединение потеряно!', {
        ...toastConfig,
        icon: <Wifi />,
        style: {
          gap: 14,
        },
      });
    }
  }, [isOnline]);

  return null;
}

export { ErrorReactor };
