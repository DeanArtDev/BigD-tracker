import { rcClient } from '@/shared/api/api-client';

export function TestComponents() {
  const { data } = rcClient.useQuery('get', '/users', undefined, {});

  return <div>{JSON.stringify(data, null, 2)}</div>;
}
