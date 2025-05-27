import { queryClient } from '@/shared/api/query-client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Toaster } from '@/shared/ui-kit/ui/sonner';
import { setDefaultOptions } from 'date-fns';
import { ru } from 'date-fns/locale';
import { SidebarProvider } from '@/shared/ui-kit/ui/sidebar';

setDefaultOptions({ locale: ru });

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools client={queryClient} />
      <SidebarProvider>{children}</SidebarProvider>
      <Toaster richColors />
    </QueryClientProvider>
  );
}
