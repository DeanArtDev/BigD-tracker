import { queryClient } from '@/shared/api/query-client';
import { authQueryKeys } from './query';

function useInvalidateMe() {
  return () => {
    return queryClient.invalidateQueries({ queryKey: authQueryKeys.me() });
  };
}

export { useInvalidateMe };
