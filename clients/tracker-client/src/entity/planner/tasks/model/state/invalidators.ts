import { queryClient } from '@/shared/api/query-client';
import { isEqual } from 'lodash-es';
import { tasksDiaryQueryKeys } from './query';

function useInvalidateDiaryTasks() {
  return () =>
    queryClient.invalidateQueries({
      predicate: (query) => {
        const mainKey = query.queryKey.slice(0, 2);
        return isEqual(mainKey, tasksDiaryQueryKeys.mainKey);
      },
    });
}

export { useInvalidateDiaryTasks };
