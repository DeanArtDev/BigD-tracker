import { $privetQueryClient } from '@/shared/api/api-client';

function useMe({ enabled }: { enabled: boolean } = { enabled: false }) {
  const { data, ...others } = $privetQueryClient.useQuery('get', '/users/me', {
    enabled,
  });
  return { data: data?.data, ...others };
}

export { useMe };
