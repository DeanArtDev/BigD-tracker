import { queryClient } from '@/shared/api/query-client';
import { isEqual } from 'lodash-es';
import { tasksQueryKeys } from './query';

function useInvalidateTasks() {
  return () =>
    queryClient.invalidateQueries({
      predicate: (query) => {
        const mainKey = query.queryKey.slice(0, 2);
        return isEqual(mainKey, tasksQueryKeys.mainKey);
      },
    });
}

export { useInvalidateTasks };
