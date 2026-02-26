import { AppSidebar } from '@/feature/sidebar';
import { ContentWrapper } from '@/shared/components/content-wrapper';
import { SidebarProvider, useSidebarStore } from '@/shared/ui-kit/ui/sidebar';
import type { ReactNode } from 'react';
import { AppMain } from './app-main';
import { AppHeader } from './app-header';

function AppGlobalSidebar({ children }: { children: ReactNode }) {
  const { sidebar_state: sidebarState } = useSidebarStore();

  return (
    <SidebarProvider className="bg-sidebar" open={sidebarState} defaultOpen={sidebarState}>
      <AppSidebar />

      <ContentWrapper className="md:pl-0">
        <AppHeader />

        <AppMain>{children}</AppMain>
      </ContentWrapper>
    </SidebarProvider>
  );
}

export { AppGlobalSidebar };
