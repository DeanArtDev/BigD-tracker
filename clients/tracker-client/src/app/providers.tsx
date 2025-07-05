import { queryClient } from '@/shared/api/query-client';
import { useSidebarStore } from '@/shared/ui-kit/hooks/use-sidebar-storage';
import { SidebarProvider } from '@/shared/ui-kit/ui/sidebar';
import { Toaster } from '@/shared/ui-kit/ui/sonner';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { setDefaultOptions } from 'date-fns';
import { ru } from 'date-fns/locale';
import { type ReactNode } from 'react';

setDefaultOptions({ locale: ru });

export function Providers({ children }: { children: ReactNode }) {
  const { sidebar_state: sidebarState } = useSidebarStore();

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools client={queryClient} />
      <SidebarProvider className="bg-sidebar" open={sidebarState} defaultOpen={sidebarState}>
        {children}
      </SidebarProvider>
      <Toaster richColors />
    </QueryClientProvider>
  );
}
