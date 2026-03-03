import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface RenderWithProvidersOptions {
  queryClient?: QueryClient;
}

export function renderWithProviders(ui: ReactElement, options?: RenderWithProvidersOptions) {
  const queryClient = options?.queryClient ?? createTestQueryClient();

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

export function withProviders(children: ReactNode, options?: RenderWithProvidersOptions) {
  const queryClient = options?.queryClient ?? createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
