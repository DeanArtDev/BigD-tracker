import { $privetQueryClient } from '@/shared/api/api-client';
import { thingsQueryKeys } from './query';

function useGetThings(params: { filters?: { from?: string; to?: string } } = {}) {
  const { data, ...others } = $privetQueryClient.useQuery(
    ...thingsQueryKeys.getThings(params.filters),
  );

  return {
    things: data?.data ?? [],
    isEmpty: data?.data == null,
    ...others,
  };
}

export { useGetThings };
