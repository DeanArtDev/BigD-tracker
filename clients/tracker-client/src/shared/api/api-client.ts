import qs from 'qs';
import { customFetchFabric } from './custom-fetch';
import createClient from 'openapi-fetch';
import { default as createOpenapiReactQueryClient } from 'openapi-react-query';
import { APP_CONFIG } from '@/shared/lib/app-config';
import type { ApiPaths } from './types';

const apiPublicClient = createClient<ApiPaths>({
  baseUrl: APP_CONFIG.API_BASE_URL,
  credentials: 'include',
  fetch: customFetchFabric({ timeout: 5000 }),
});
const apiPrivateClient = createClient<ApiPaths>({
  baseUrl: APP_CONFIG.API_BASE_URL,
  credentials: 'include',
  fetch: customFetchFabric({ timeout: 5000 }),
  querySerializer: (query) => qs.stringify(query, { addQueryPrefix: true }),
});

const $publicQueryClient = createOpenapiReactQueryClient(apiPublicClient);
const $privetQueryClient = createOpenapiReactQueryClient(apiPrivateClient);

export { apiPublicClient, apiPrivateClient, $publicQueryClient, $privetQueryClient };
