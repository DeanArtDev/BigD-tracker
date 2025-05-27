import { queryClient } from '@/shared/api/query-client';
import { authQueryKeys } from './query';

function useInvalidateMe() {
  return () => {
    return queryClient.invalidateQueries({ queryKey: authQueryKeys.me() });
  };
}
function useDropEverything() {
  return () => {
    return queryClient.clear();
  };
}

export { useInvalidateMe, useDropEverything };
