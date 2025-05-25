import { queryClient } from '@/shared/api/query-client';
import { trainingsQueryKeys } from './query';

function useInvalidateGetTrainings() {
  return () => {
    return queryClient.invalidateQueries({ queryKey: trainingsQueryKeys.getTrainings() });
  };
}

export { useInvalidateGetTrainings };
