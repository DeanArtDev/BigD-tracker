import { getEnvConfigClient } from '@/shared/lib';

const clientConfig = getEnvConfigClient();

const appFetchOptions: RequestInit & { uri: string } = {
  uri: '/api/graphql',
  referrerPolicy: 'strict-origin',
  mode: clientConfig.IS_DEV ? 'cors' : 'same-origin',
  redirect: 'error',
};

export { appFetchOptions };
