import { useMeSuspense } from '@/entity/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/shared/ui-kit/ui/sidebar';
import { NavMenu } from './nav-menu';
import { NavUser } from './nav-user';

export function AppSidebar() {
  const { me } = useMeSuspense();
  const { email, avatar, screenName } = me;

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <NavUser user={{ email, avatar, name: screenName }} />
      </SidebarHeader>
      <SidebarContent>
        <NavMenu />
      </SidebarContent>
      <SidebarFooter>footer</SidebarFooter>
    </Sidebar>
  );
}
