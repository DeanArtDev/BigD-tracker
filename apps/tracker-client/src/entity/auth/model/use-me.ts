import { $privetQueryClient } from '@/shared/api/api-client';
import { authQueryKeys } from './query';

function useMe({ enabled }: { enabled: boolean } = { enabled: false }) {
  const { data, ...others } = $privetQueryClient.useQuery(...authQueryKeys.me(), undefined, {
    enabled,
  });
  return { data: data?.data, ...others };
}

export { useMe };
