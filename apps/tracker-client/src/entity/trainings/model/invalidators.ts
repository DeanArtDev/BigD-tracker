import { queryClient } from '@/shared/api/query-client';
import { trainingsQueryKeys } from './query';

function useInvalidateTrainingsTemplates() {
  return () => {
    return queryClient.invalidateQueries({ queryKey: trainingsQueryKeys.getTrainings() });
  };
}

export { useInvalidateTrainingsTemplates };
