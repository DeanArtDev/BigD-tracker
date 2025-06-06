import { queryClient } from '@/shared/api/query-client';
import { isEqual } from 'lodash-es';
import { trainingsQueryKeys } from './query';

function useInvalidateTrainings() {
  return (filters?: { from: string; to: string }, options?: { drop: boolean }) => {
    const { drop = false } = options ?? {};

    if (drop) {
      return queryClient.invalidateQueries({
        predicate: (query) => {
          const mainKey = query.queryKey.slice(0, 2);
          return isEqual(mainKey, trainingsQueryKeys.mainKey);
        },
      });
    }

    return queryClient.invalidateQueries({
      exact: true,
      queryKey: trainingsQueryKeys.getTrainings(filters),
    });
  };
}

export { useInvalidateTrainings };
