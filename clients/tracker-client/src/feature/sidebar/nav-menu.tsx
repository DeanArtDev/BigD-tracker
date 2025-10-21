import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/ui-kit/ui/sidebar';
import { ChevronLeft, type LucideIcon } from 'lucide-react';
import { Link, type To, useLocation } from 'react-router-dom';
import { navMenuItems } from './lib/nav-items-config';

interface NavMenuItem {
  readonly title: string;
  readonly to: To;
  readonly icon?: LucideIcon;
  readonly defaultOpen?: boolean;
}

function NavMenu() {
  const { pathname } = useLocation();
  const { isMobile, toggleSidebar } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Приложения</SidebarGroupLabel>

      <SidebarMenu>
        {navMenuItems.map((item) => {
          const isCurrentItem = pathname.includes(item.to.toString());

          return (
            <SidebarMenuItem key={item.title}>
              <Link to={item.to}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={pathname.includes(item.to.toString())}
                  onClick={() => {
                    isMobile && toggleSidebar();
                  }}
                >
                  {item.icon && <item.icon />}

                  {item.title}

                  {isCurrentItem && <ChevronLeft className="ml-auto" />}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export { NavMenu, type NavMenuItem };
