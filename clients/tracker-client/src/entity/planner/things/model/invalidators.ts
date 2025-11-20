import { queryClient } from '@/shared/api/query-client';
import { isEqual } from 'lodash-es';
import { thingsQueryKeys } from './query';

function useInvalidateThings() {
  return () =>
    queryClient.invalidateQueries({
      predicate: (query) => {
        const mainKey = query.queryKey.slice(0, 2);
        return isEqual(mainKey, thingsQueryKeys.mainKey);
      },
    });
}

export { useInvalidateThings };
