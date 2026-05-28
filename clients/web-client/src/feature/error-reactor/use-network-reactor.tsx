import { Wifi } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useOnlineStatus } from '@/shared/lib/application-status';
import { toastConfig } from './config';

function useNetworkReactor() {
  const firstNotify = useRef(false);
  const toastId = useRef<string | number | undefined>(undefined);
  const isOnline = useOnlineStatus();

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
}

export { useNetworkReactor };
