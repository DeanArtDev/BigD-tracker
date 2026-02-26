import { isExceptionUnauthorized } from '@/entity/auth/model/errors';
import { ClientTimeoutError } from '@/shared/api/exceptions';
import { getQueryClient } from '@/shared/api/query-client';
import { routes } from '@/shared/lib/routes';
import { MutationCache, QueryCache, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { setDefaultOptions } from 'date-fns';
import { ru } from 'date-fns/locale';
import { type ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppTaster } from './components/app-taster';

setDefaultOptions({ locale: ru });

function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const queryClient = useMemo(() => {
    return getQueryClient({
      mutationCache: new MutationCache({
        onError: (error) => {
          if (isExceptionUnauthorized(error)) {
            navigate(routes.login.path, { replace: true });
          }
        },
      }),

      queryCache: new QueryCache({
        onError: (error) => {
          if (error instanceof ClientTimeoutError) {
            toast.dismiss();
            toast.info('Превышен таймаут запроса, возможно из за плохого интернет соединения', {
              duration: 5000,
            });
          }

          if (isExceptionUnauthorized(error)) {
            navigate(routes.login.path, { replace: true });
          }
        },
      }),

      defaultOptions: {
        queries: {
          retry: 3,
          staleTime: 1000 * 60 * 5,
        },
        mutations: {
          retry: 1,
        },
      },
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools client={queryClient} buttonPosition="bottom-left" />
      {children}
      <AppTaster />
    </QueryClientProvider>
  );
}

export { Providers };
