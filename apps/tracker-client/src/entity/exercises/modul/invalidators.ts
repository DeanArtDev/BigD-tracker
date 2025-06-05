import { useExerciseTemplatesUrlParams } from './use-exercise-templates-url-params';
import { queryClient } from '@/shared/api/query-client';
import { exerciseQueryKeys } from './query';

function useInvalidateExerciseTemplates() {
  const { isMy } = useExerciseTemplatesUrlParams();
  return (params?: { my: boolean }) => {
    return queryClient.invalidateQueries({
      queryKey: exerciseQueryKeys.getExerciseTemplates(params ?? { my: isMy }),
    });
  };
}

export { useInvalidateExerciseTemplates };
