import { useMeSuspense } from '@/entity/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/shared/ui-kit/ui/sidebar';
import * as React from 'react';
import { NavMenu } from './nav-menu';
import { NavUser } from './nav-user';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { me } = useMeSuspense();
  const { email, avatar, screenName } = me;

  return (
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
  );
}
