import { queryClient } from '@/shared/api/query-client';
import { exerciseQueryKeys } from './query';

function useInvalidateExerciseTemplates() {
  return (params?: { my: boolean }) => {
    return queryClient.invalidateQueries({
      queryKey: exerciseQueryKeys.getExerciseTemplates(params),
    });
  };
}

export { useInvalidateExerciseTemplates };
