import { toast } from 'sonner';
import { useRegisterSW } from 'virtual:pwa-register/react';

function usePwaUpdateToast() {
  const {
    updateServiceWorker,

    offlineReady: [, setOfflineReady],
    needRefresh: [, setNeedRefresh],
  } = useRegisterSW({
    onNeedRefresh() {
      toast.info('Доступно обновление!', {
        description: 'Новая версия приложения уже скачалась.',
        position: 'top-center',
        duration: Infinity,
        closeButton: true,
        onDismiss: () => {
          setOfflineReady(false);
          setNeedRefresh(false);
        },
        action: {
          label: 'Обновить',
          onClick: () => void updateServiceWorker(true),
        },
      });
    },
    onRegisterError(error: unknown) {
      console.error('SW registration error:', error);
    },
  });
}

export { usePwaUpdateToast };
