import { $privetQueryClient } from '@/shared/api/api-client';
import { trainingTemplatesQueryKeys } from './query';

function useTrainingsTemplateByIdQuery(params: { templateId?: number }) {
  const { data, ...others } = $privetQueryClient.useQuery(
    ...trainingTemplatesQueryKeys.getOneTrainingTemplates(params),
    { enabled: params.templateId != null },
  );

  return {
    trainingTemplate: data?.data,
    isEmpty: data?.data == null,
    ...others,
  };
}

export { useTrainingsTemplateByIdQuery };
