import { useExerciseUrlParams } from './use-exercise-url-params';
import { queryClient } from '@/shared/api/query-client';
import { exerciseQueryKeys } from './query';

function useInvalidateExerciseTemplates() {
  const { isMy } = useExerciseUrlParams();
  return (params?: { my: boolean }) => {
    return queryClient.invalidateQueries({
      queryKey: exerciseQueryKeys.getExerciseTemplates(params ?? { my: isMy }),
    });
  };
}

export { useInvalidateExerciseTemplates };
