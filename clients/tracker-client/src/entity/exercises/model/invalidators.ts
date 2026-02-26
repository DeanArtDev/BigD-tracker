import { useQueryClient } from '@tanstack/react-query';
import { useExerciseUrlParams } from './use-exercise-url-params';
import { exerciseQueryKeys } from './query';

function useInvalidateExerciseTemplates() {
  const { isMy } = useExerciseUrlParams();
  const queryClient = useQueryClient();

  return (params?: { my: boolean }) => {
    return queryClient.invalidateQueries({
      queryKey: exerciseQueryKeys.getExerciseTemplates(params ?? { my: isMy }),
    });
  };
}

export { useInvalidateExerciseTemplates };
