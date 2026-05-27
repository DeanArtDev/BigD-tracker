import { HttpLink } from '@apollo/client';
import { appFetchOptions } from '../constants';

const createHttpLink = (options: { headers: Record<string, string> } = { headers: {} }) => {
  return new HttpLink({
    ...appFetchOptions,
    ...options,
    fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10000) }),
    fetchOptions: {
      cache: 'no-store',
    },
  });
};

export { createHttpLink };
