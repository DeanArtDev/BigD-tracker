import { appFetchOptions } from './constants';

type RefreshTokenResponse = { data: boolean; errors: null | { extensions: Record<string, unknown> }[] };

async function fetchRefreshToken(params?: {
  headers: Record<string, string>;
}): Promise<{ data: RefreshTokenResponse; response: Response }> {
  const { uri, ...fetchOptions } = appFetchOptions;
  const response = await fetch(uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(params?.headers ?? {}),
    },
    body: JSON.stringify({
      operationName: 'Refresh',
      query: 'mutation Refresh { refresh }',
    }),
    cache: 'no-store',
    ...fetchOptions,
  });

  const res = response.clone();

  return {
    response: res,
    data: (await response.json()) as RefreshTokenResponse,
  };
}

export { fetchRefreshToken, type RefreshTokenResponse };
