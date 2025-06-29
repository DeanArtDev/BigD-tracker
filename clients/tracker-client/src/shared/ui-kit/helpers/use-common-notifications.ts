import { toast } from 'sonner';

function useCommonNotifications() {
  return {
    success: () => toast.success('👍🏽 Успешно!', { position: 'top-center' }),
    somethingWentWrong: () =>
      toast.error('Что то пошло не так, попробуйте еще раз', {
        position: 'top-center',
      }),
  };
}

export { useCommonNotifications };
