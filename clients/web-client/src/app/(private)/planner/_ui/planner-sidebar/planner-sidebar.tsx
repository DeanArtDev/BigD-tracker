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
import { plannerPaths } from './config';
import { PlannerSidebarMenuItem } from './planner-sidebar-menu-item';
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
  const pathname = usePathname();

  return (
    <SidebarProvider className="flex flex-col" defaultOpen={defaultOpen}>
      {headerSlot}

      <div className="flex flex-1">
        <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]" collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {plannerPaths.map((p) => (
                  <PlannerSidebarMenuItem
                    key={p.path}
                    href={p.path}
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

        <SidebarInset>{content}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export { PlannerSidebar };
