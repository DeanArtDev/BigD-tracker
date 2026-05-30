import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { meQuery } from '@/entity/user/server';
import { routes } from '@/shared/routes';
import { isUnauthorized } from '@/shared/transport/graphql';
import { MeCacheHydrator } from './me-cache-hydrate';

async function InitDataPrefetcher({ children }: PropsWithChildren) {
  const { data, error } = await meQuery();

  if (isUnauthorized(error) != null) redirect(routes.login.path);
  if (error != null) throw error;

  return <MeCacheHydrator data={data}>{children}</MeCacheHydrator>;
}

export { InitDataPrefetcher };
