import { $privetQueryClient } from '@/shared/api/api-client';
import { authQueryKeys } from './query';

function useMe({ throwOnError, retry }: { retry?: number; throwOnError?: boolean } = {}) {
  const { data, ...others } = $privetQueryClient.useQuery(...authQueryKeys.me(), undefined, {
    refetchOnWindowFocus: false,
    retry,
    throwOnError,
  });
  return { me: data?.data, ...others };
}

export { useMe };
