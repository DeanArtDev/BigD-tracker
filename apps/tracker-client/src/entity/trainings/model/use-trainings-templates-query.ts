import { $privetQueryClient } from '@/shared/api/api-client';
import { trainingsQueryKeys } from './query';

function useTrainingsTemplatesQuery() {
  const { data, ...others } = $privetQueryClient.useQuery(
    ...trainingsQueryKeys.getTrainings(),
  );

  return {
    data: data?.data,
    isEmpty: (data?.data?.length ?? 0) <= 0,
    ...others,
  };
}

export { useTrainingsTemplatesQuery };
