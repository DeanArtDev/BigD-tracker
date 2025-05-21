import { $privetQueryClient } from '@/shared/api/api-client';

function useMeSuspense({ enabled = false }: { enabled: boolean }) {
  const { data, ...others } = $privetQueryClient.useSuspenseQuery('get', '/users/me', {
    enabled,
  });
  return { data, ...others };
}

export { useMeSuspense };
