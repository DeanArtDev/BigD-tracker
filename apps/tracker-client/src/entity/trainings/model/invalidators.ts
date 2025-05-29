import { queryClient } from '@/shared/api/query-client';
import { trainingsQueryKeys } from './query';

function useInvalidateTrainingsTemplates() {
  return () => {
    return queryClient.invalidateQueries({
      queryKey: trainingsQueryKeys.getTrainingsTemplates(),
    });
  };
}

function useInvalidateTrainings() {
  return (filters?: { from: string; to: string }) => {
    return queryClient.invalidateQueries({
      queryKey: trainingsQueryKeys.getTrainings(filters),
    });
  };
}

export { useInvalidateTrainingsTemplates, useInvalidateTrainings };
