import { useAccessTokenStore, useAuthStore } from '@/entity/auth';
import { useLogout } from '@/feature/logout';
import { routes } from '@/shared/lib/routes';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui-kit/ui/avatar';
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/shared/ui-kit/ui/dropdown-menu';
import { useSidebar } from '@/shared/ui-kit/ui/sidebar';
import { LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function UserDropdownMenu(props: { name?: string; email?: string; avatar?: string }) {
  const { name, email, avatar } = props;
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const setAccessToken = useAccessTokenStore((state) => state.setAccessToken);
  const setIsAuth = useAuthStore((state) => state.setIsAuth);

  const { logout, isPending } = useLogout();

  return (
    <DropdownMenuContent
      className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
      side={isMobile ? 'bottom' : 'right'}
      align="end"
      sideOffset={4}
    >
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{name}</span>
            <span className="truncate text-xs">{email}</span>
          </div>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem onClick={() => navigate(routes.settings.path)}>
          <Settings />
          Настройки
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        disabled={isPending}
        onClick={() =>
          void logout(undefined, {
            onSuccess: async () => {
              setIsAuth(false);
              setAccessToken(undefined);
              await navigate(routes.login.path);
            },
          })
        }
      >
        <LogOut />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

export { UserDropdownMenu };
