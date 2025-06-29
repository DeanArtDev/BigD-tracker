import { $privetQueryClient } from '@/shared/api/api-client';
import { authQueryKeys } from './query';

function useMeSuspense() {
  const { data, ...others } = $privetQueryClient.useSuspenseQuery(...authQueryKeys.me());
  return { me: data.data, ...others };
}

export { useMeSuspense };
