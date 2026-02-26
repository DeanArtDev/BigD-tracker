import { QueryClient, type QueryClientConfig } from '@tanstack/react-query';

export const getQueryClient = (config: QueryClientConfig) => new QueryClient(config);
