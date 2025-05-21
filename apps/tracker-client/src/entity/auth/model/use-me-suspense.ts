import { $privetQueryClient } from '@/shared/api/api-client';

function useMeSuspense({ enabled }: { enabled: boolean } = { enabled: false }) {
  const { data, ...others } = $privetQueryClient.useSuspenseQuery('get', '/users/me', {
    enabled,
  });
  return { data: data.data, ...others };
}

export { useMeSuspense };
