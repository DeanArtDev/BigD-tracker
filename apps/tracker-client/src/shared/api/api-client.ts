import createClient, { type Middleware } from 'openapi-fetch';
import { APP_CONFIG } from '@/shared/lib/app-config';
import { default as createOpenapiReactQueryClient } from 'openapi-react-query';
import type { ApiEndpoints } from './types';

const apiPublicClient = createClient<ApiEndpoints>({
  baseUrl: APP_CONFIG.API_BASE_URL,
  credentials: 'include',
});

const rcClient = createOpenapiReactQueryClient(apiPublicClient);

const myMiddleware: Middleware = {
  async onRequest() {
    return undefined;
  },
  async onResponse() {
    return undefined;
  },
  async onError() {
    return undefined;
  },
};

apiPublicClient.use(myMiddleware);

export { apiPublicClient, rcClient };
