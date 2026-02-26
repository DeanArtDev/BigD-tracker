import { useQueryClient } from '@tanstack/react-query';
import { trainingTemplatesQueryKeys } from './query';
import { useTrainingTemplatesUrlParams } from './use-training-templates-url-params';

function useInvalidateTrainingsTemplates() {
  const { isMy } = useTrainingTemplatesUrlParams();
  const queryClient = useQueryClient();

  return async (params?: { my: boolean }) => {
    return queryClient.invalidateQueries({
      queryKey: trainingTemplatesQueryKeys.getTrainingsTemplates(params ?? { my: isMy }),
    });
  };
}

function useInvalidateTrainingsTemplateById() {
  const queryClient = useQueryClient();

  return async (params: { templateId: number }) => {
    return queryClient.invalidateQueries({
      queryKey: trainingTemplatesQueryKeys.getOneTrainingTemplates(params),
    });
  };
}

export { useInvalidateTrainingsTemplates, useInvalidateTrainingsTemplateById };
