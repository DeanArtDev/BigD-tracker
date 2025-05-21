import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui-kit/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger } from '@/shared/ui-kit/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui-kit/ui/sidebar';
import { ChevronsUpDown } from 'lucide-react';
import { UserDropdownMenu } from '@/feature/sidebar/user-dropdown-menu';

export function NavUser({
  user,
}: {
  user: {
    name?: string;
    email: string;
    avatar?: string;
  };
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">UN</AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>

              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <UserDropdownMenu avatar={user.avatar} email={user.email} name={user.name} />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
