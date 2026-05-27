import { getEnvConfigClient } from '@/shared/lib';

const clientConfig = getEnvConfigClient();

const appFetchOptions: RequestInit & { uri: string } = {
  uri: clientConfig.NEXT_PUBLIC_HTTP_API_URL,
  referrerPolicy: 'strict-origin',
  mode: clientConfig.IS_DEV ? 'cors' : 'same-origin',
  redirect: 'error',
};

export { appFetchOptions };
