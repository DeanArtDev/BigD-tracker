import { HttpLink } from '@apollo/client';
import { exceptionCode } from '@big-d/exceptions';
import { appFetchOptions } from '../constants';
import { ApiError } from '../exceptions';

const REQUEST_TIMEOUT_MS = 10000;

function isTimeoutDomException(err: unknown): err is DOMException {
  return (
    typeof DOMException !== 'undefined' &&
    err instanceof DOMException &&
    (err.name === 'TimeoutError' || err.name === 'AbortError')
  );
}

const createHttpLink = (options: { headers: Record<string, string> } = { headers: {} }) => {
  return new HttpLink({
    ...appFetchOptions,
    ...options,
    fetch: async (input, init) => {
      try {
        return await fetch(input, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      } catch (err) {
        if (isTimeoutDomException(err)) {
          throw new ApiError({
            key: 'TIMEOUT',
            code: exceptionCode.requestTimeout.code,
            message: `Превышен таймаут запроса (${REQUEST_TIMEOUT_MS} мс)`,
            correlationId: 'n/a',
          });
        }
        throw err;
      }
    },
    fetchOptions: {
      cache: 'no-store',
    },
  });
};

export { createHttpLink };
