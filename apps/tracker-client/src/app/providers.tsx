import { queryClient } from '@/shared/api/query-client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Toaster } from '@/shared/ui-kit/ui/sonner';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools client={queryClient} />
      {children}
      <Toaster richColors />
    </QueryClientProvider>
  );
}
