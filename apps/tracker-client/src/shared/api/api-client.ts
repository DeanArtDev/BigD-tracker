import createClient from 'openapi-fetch';
import { default as createOpenapiReactQueryClient } from 'openapi-react-query';
import { APP_CONFIG } from '@/shared/lib/app-config';
import type { ApiEndpoints } from './types';

const apiPublicClient = createClient<ApiEndpoints>({
  baseUrl: APP_CONFIG.API_BASE_URL,
  credentials: 'include',
});
const apiPrivateClient = createClient<ApiEndpoints>({
  baseUrl: APP_CONFIG.API_BASE_URL,
  credentials: 'include',
});

const $publicQueryClient = createOpenapiReactQueryClient(apiPublicClient);
const $privetQueryClient = createOpenapiReactQueryClient(apiPrivateClient);

export { apiPublicClient, apiPrivateClient, $publicQueryClient, $privetQueryClient };
