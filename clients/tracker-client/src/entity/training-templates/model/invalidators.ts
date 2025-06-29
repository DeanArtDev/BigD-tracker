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

function useInvalidateTrainingsTemplateById() {
  return async (params: { templateId: number }) => {
    return queryClient.invalidateQueries({
      queryKey: trainingTemplatesQueryKeys.getOneTrainingTemplates(params),
    });
  };
}

export { useInvalidateTrainingsTemplates, useInvalidateTrainingsTemplateById };
