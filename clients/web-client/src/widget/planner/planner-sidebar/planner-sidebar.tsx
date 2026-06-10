'use client';

import { ReactNode } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarInset,
  SidebarProvider,
  SidebarSeparator,
} from '@/shared/ui-kit';
import { useSidebarInfoQuerySuspense } from './model/use-sidebar-info';
import { PlannerSidebarNavList } from './planner-sidebar-nav-list';
import { PlannerSidebarTrigger } from './planner-sidebar-trigger';

function PlannerSidebar({
  content,
  headerSlot,
  defaultOpen,
}: {
  headerSlot?: ReactNode;
  content: ReactNode;
  defaultOpen?: boolean;
}) {
  const {
    data: { inboxCount },
  } = useSidebarInfoQuerySuspense();

  return (
    <SidebarProvider className="flex flex-col h-screen overscroll-y-auto" defaultOpen={defaultOpen}>
      {headerSlot}

      <div className="grid grow grid-cols-[min-content_1fr] min-h-0">
        <Sidebar
          className="top-(--header-height) h-[calc(100svh-var(--header-height))]"
          collapsible="icon"
          variant="floating"
        >
          <SidebarContent>
            <SidebarGroup>
              <PlannerSidebarNavList inboxCount={inboxCount} />
            </SidebarGroup>
          </SidebarContent>

          <SidebarSeparator className="mx-0" />
          <SidebarFooter>
            <PlannerSidebarTrigger />
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="grow min-h-0">{content}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export { PlannerSidebar };
