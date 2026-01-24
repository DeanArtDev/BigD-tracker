import { queryClient } from '@/shared/api/query-client';

function useDropEverything() {
  return () => {
    return queryClient.clear();
  };
}

export { useDropEverything };
