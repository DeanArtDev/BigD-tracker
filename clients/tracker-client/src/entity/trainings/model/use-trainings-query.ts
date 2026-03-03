import { $privetQueryClient } from '@/shared/api/api-client';
import { trainingsQueryKeys } from './query';

function useTrainingsQuery(filters?: { from: string; to: string }, { enabled }: { enabled?: boolean } = {}) {
  const { data, ...others } = $privetQueryClient.useQuery(...trainingsQueryKeys.getTrainings(filters), { enabled });

  return {
    data: data?.data,
    isEmpty: (data?.data?.length ?? 0) <= 0,
    ...others,
  };
}

export { useTrainingsQuery };
