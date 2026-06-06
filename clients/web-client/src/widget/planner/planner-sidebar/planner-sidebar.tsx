'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarProvider,
  SidebarSeparator,
} from '@/shared/ui-kit';
import { useSidebarInfoQuerySuspense } from './model/use-sidebar-info';
import { PlannerSidebarMenuItem } from './planner-sidebar-menu-item';
import { PlannerSidebarTrigger } from './planner-sidebar-trigger';
import { useNavItems } from './view-model/use-nav-items';

function PlannerSidebar({
  content,
  headerSlot,
  defaultOpen,
}: {
  headerSlot?: ReactNode;
  content: ReactNode;
  defaultOpen?: boolean;
}) {
  const pathname = usePathname();

  const {
    data: { inboxCount },
  } = useSidebarInfoQuerySuspense();
  const navItems = useNavItems({ inboxCount });

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
              <SidebarMenu>
                {navItems.map((p) => (
                  <PlannerSidebarMenuItem
                    key={p.path}
                    path={p.path}
                    title={p.title}
                    icon={p.icon}
                    active={pathname.includes(p.path)}
                  />
                ))}
              </SidebarMenu>
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
