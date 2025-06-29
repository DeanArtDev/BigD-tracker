import { useOnlineStatus } from '@/shared/lib/react/use-online-status';
import { Wifi } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

function NetworkErrorNotifier() {
  const toastId = useRef<string | number | undefined>(undefined);
  const isOnline = useOnlineStatus();
  const firstNotify = useRef(false);

  if (isOnline && firstNotify.current) {
    toast.dismiss(toastId.current);
    toastId.current = toast.success('Интернет соединение восстановлено!', {
      position: 'top-center',
      icon: <Wifi />,
      style: {
        gap: 14,
      },
    });
    return null;
  } else {
    firstNotify.current = true;
    toast.dismiss(toastId.current);
    toastId.current = toast.error('Интернет соединение потеряно!', {
      position: 'top-center',
      icon: <Wifi />,
      style: {
        gap: 14,
      },
    });
    return null;
  }
}

export { NetworkErrorNotifier };
