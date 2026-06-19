import { Wifi } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNotify } from '@/shared/lib';
import { useOnlineStatus } from '@/shared/lib/application-status';

function useNetworkReactor() {
  const firstNotify = useRef(false);
  const toastId = useRef<string | number | undefined>(undefined);
  const isOnline = useOnlineStatus();
  const { dismiss, success, error } = useNotify();

  useEffect(() => {
    if (isOnline && firstNotify.current) {
      dismiss(toastId.current);
      toastId.current = success({
        message: 'Интернет соединение восстановлено!',
        icon: <Wifi />,
        position: 'top-center',
        style: {
          gap: 14,
        },
      });
    }

    if (!isOnline && !firstNotify.current) {
      firstNotify.current = true;
      dismiss(toastId.current);
      toastId.current = error({
        message: 'Интернет соединение потеряно!',
        icon: <Wifi />,
        position: 'top-center',
        style: {
          gap: 14,
        },
      });
    }
  }, [dismiss, error, isOnline, success]);
}

export { useNetworkReactor };
