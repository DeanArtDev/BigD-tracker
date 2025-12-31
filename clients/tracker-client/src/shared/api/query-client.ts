import { isExceptionUnauthorized } from '@/entity/auth/model/errors';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 3,
      staleTime: 1000 * 60 * 5,
      throwOnError: (err) => [isExceptionUnauthorized].some((guard) => guard(err)),
    },
    mutations: {
      retry: 1,
    },
  },
});
