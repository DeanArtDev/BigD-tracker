import { isExceptionUnauthorized } from '@big-d/api-exceptions';
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
