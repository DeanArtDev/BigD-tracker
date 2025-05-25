import { ChevronRight, type LucideIcon } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/shared/ui-kit/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui-kit/ui/collapsible';
import { Link, type To, useLocation } from 'react-router-dom';
import { navMenuItems } from './lib/nav-items-config';

interface NavMenuItem {
  readonly title: string;
  readonly to: To;
  readonly icon?: LucideIcon;
  readonly defaultOpen?: boolean;
  readonly items?: { title: string; to: To }[];
}

/*TODO
 *  [] добавить логику сохранения открытых\закрытых элементов меню
 * */
function NavMenu() {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Приложения</SidebarGroupLabel>
      <SidebarMenu>
        {navMenuItems.map((item) => {
          const isCurrentItem = pathname.includes(item.to.toString());

          return (
            <Collapsible
              asChild
              key={item.title}
              defaultOpen={item.defaultOpen || isCurrentItem}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={pathname.includes(item.to.toString())}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={pathname === subItem.to}>
                          <Link to={subItem.to}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export { NavMenu, type NavMenuItem };
