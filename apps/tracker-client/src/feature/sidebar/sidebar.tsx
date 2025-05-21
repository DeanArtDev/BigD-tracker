import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarRail,
} from '@/shared/ui-kit/ui/sidebar';
import { useMeSuspense } from '@/entity/auth';
import { NavMenu } from './nav-menu';
import { NavUser } from './nav-user';

export function AppSidebar({ children, ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: me } = useMeSuspense();
  const { email, avatar, screenName } = me;

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <NavUser user={{ email, avatar, name: screenName }} />
        </SidebarHeader>
        <SidebarContent>
          <NavMenu />
        </SidebarContent>
        <SidebarFooter></SidebarFooter>
        footer
        <SidebarRail />
      </Sidebar>

      {children}
    </SidebarProvider>
  );
}
