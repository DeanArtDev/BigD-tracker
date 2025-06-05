import { queryClient } from '@/shared/api/query-client';
import { trainingTemplatesQueryKeys } from './query';
import { useTrainingTemplatesUrlParams } from './use-training-templates-url-params';

function useInvalidateTrainingsTemplates() {
  const { isMy } = useTrainingTemplatesUrlParams();
  return async (params?: { my: boolean }) => {
    return queryClient.invalidateQueries({
      queryKey: trainingTemplatesQueryKeys.getTrainingsTemplates(params ?? { my: isMy }),
    });
  };
}

export { useInvalidateTrainingsTemplates };
