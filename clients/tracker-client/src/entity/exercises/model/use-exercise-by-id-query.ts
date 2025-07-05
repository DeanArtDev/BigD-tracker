import { $privetQueryClient } from '@/shared/api/api-client';
import { exerciseQueryKeys } from './query';

function useExerciseByIdQuery(params: { id?: number }) {
  const { data, ...others } = $privetQueryClient.useQuery(
    ...exerciseQueryKeys.getExerciseTemplateById(params),
  );

  return {
    data: data?.data,
    isEmpty: data?.data == null,
    ...others,
  };
}

export { useExerciseByIdQuery };
