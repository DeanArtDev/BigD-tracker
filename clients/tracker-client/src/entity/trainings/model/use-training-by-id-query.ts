import { $privetQueryClient } from '@/shared/api/api-client';
import { trainingsQueryKeys } from './query';

function useTrainingByIdQuery(params: { id?: number }) {
  const { data, ...others } = $privetQueryClient.useQuery(
    ...trainingsQueryKeys.getTrainingById(params),
    { enabled: params.id != null },
  );

  return {
    data: data?.data,
    isEmpty: data?.data == null,
    ...others,
  };
}

export { useTrainingByIdQuery };
