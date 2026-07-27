import { ReactNode, useCallback } from 'react';
import { ExternalToast, toast } from 'sonner';
import { fromApolloError } from '@/shared/transport/graphql';

type NotificationParams = ExternalToast & {
  readonly message?: ReactNode;
};

type NotificationPromise = Parameters<typeof toast.promise>;

function useNotify() {
  return {
    dismiss: toast.dismiss,
    promise: useCallback<(...args: NotificationPromise) => void>((promise, params) => {
      return toast.promise(promise, {
        success: 'Успешно!',
        loading: 'Выполняется...',
        error: (error) => {
          const err = fromApolloError(error).at(-1);
          return {
            message: err?.message ?? 'Ошибка, попробуйте еще',
            duration: Infinity,
            closeButton: true,
          };
        },
        ...params,
      });
    }, []),
    success: useCallback((params?: NotificationParams) => toast.success(params?.message ?? 'Успешно!', params), []),
    error: useCallback(
      (params?: NotificationParams) => toast.error(params?.message ?? 'Непредвиденная ошибка!', params),
      [],
    ),
    warning: useCallback((params?: NotificationParams) => toast.warning(params?.message ?? 'Внимание!', params), []),
  };
}

export { useNotify };
