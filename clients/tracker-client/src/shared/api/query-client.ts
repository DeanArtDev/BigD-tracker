import { isExceptionUnauthorized } from '@big-d/api-exception';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 3,
      staleTime: 1000 * 60 * 5,
      throwOnError: (err) => [isExceptionUnauthorized].some((gard) => gard(err)),
    },
    mutations: {
      retry: 1,
    },
  },
});
