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
import { PlannerSidebarNavList } from './planner-sidebar-nav-list';
import { PlannerSidebarTrigger } from './planner-sidebar-trigger';
import { usePlannerSidebarState } from './view-model/use-planner-sidebar-state';

function PlannerSidebar({
  content,
  headerSlot,
  defaultOpen,
}: {
  headerSlot?: ReactNode;
  content: ReactNode;
  defaultOpen?: boolean;
}) {
  const { open, setOpen } = usePlannerSidebarState(defaultOpen);

  return (
    <SidebarProvider
      className="flex flex-col h-screen overscroll-y-auto"
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={setOpen}
    >
      {headerSlot}

      <div className="grid grow grid-cols-[min-content_1fr] min-h-0">
        <Sidebar
          className="top-(--header-height) h-[calc(100svh-var(--header-height))]"
          collapsible="icon"
          variant="floating"
        >
          <SidebarContent>
            <SidebarGroup>
              <PlannerSidebarNavList />
            </SidebarGroup>
          </SidebarContent>

          <SidebarSeparator className="mx-0" />
          <SidebarFooter>
            <PlannerSidebarTrigger />
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="grow min-h-0 pt-(--header-height)">{content}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export { PlannerSidebar };
