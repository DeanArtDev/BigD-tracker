import { $privetQueryClient } from '@/shared/api/api-client';
import { trainingTemplatesQueryKeys } from './query';

function useTrainingsTemplatesQuery(params: { my: boolean } = { my: false }) {
  const { data, ...others } = $privetQueryClient.useQuery(
    ...trainingTemplatesQueryKeys.getTrainingsTemplates(params),
  );

  return {
    data: data?.data,
    isEmpty: (data?.data?.length ?? 0) <= 0,
    ...others,
  };
}

export { useTrainingsTemplatesQuery };
