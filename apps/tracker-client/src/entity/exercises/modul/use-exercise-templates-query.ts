import { $privetQueryClient } from '@/shared/api/api-client';
import { exerciseQueryKeys } from './query';

function useExerciseTemplatesQuery(params: { my: boolean } = { my: false }) {
  const { data, ...others } = $privetQueryClient.useQuery(
    ...exerciseQueryKeys.getExerciseTemplates(params),
  );

  return {
    data: data?.data,
    isEmpty: (data?.data?.length ?? 0) <= 0,
    ...others,
  };
}

export { useExerciseTemplatesQuery };
