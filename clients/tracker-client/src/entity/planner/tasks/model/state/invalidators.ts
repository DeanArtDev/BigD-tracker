import { useQueryClient } from '@tanstack/react-query';
import { tasksQueryKeys } from './query';

function useInvalidateAllTasks() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      predicate: (query) => {
        if (Array.isArray(query.queryKey)) {
          const endpoint = query.queryKey[1];
          const mainEndpointStart = tasksQueryKeys.mainKey[1];
          return endpoint?.startsWith(mainEndpointStart);
        }
        return undefined;
      },
    });
}

export { useInvalidateAllTasks };
