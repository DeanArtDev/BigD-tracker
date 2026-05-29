import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { ME_QUERY } from '@/entity/user';
import { routes } from '@/shared/routes';
import { isUnauthorized } from '@/shared/transport/graphql';
import { query } from '@/shared/transport/graphql/server';
import { MeCacheHydrator } from './me-cache-hydrate';

async function InitDataPrefetcher({ children }: PropsWithChildren) {
  const { data, error } = await query<{ me: unknown }>({
    query: ME_QUERY,
    errorPolicy: 'all',
    context: { endpoint: 'public-cookies-include' },
  });

  if (isUnauthorized(error) != null) redirect(routes.login.path);
  if (error != null) throw error;

  return <MeCacheHydrator data={data}>{children}</MeCacheHydrator>;
}

export { InitDataPrefetcher };
