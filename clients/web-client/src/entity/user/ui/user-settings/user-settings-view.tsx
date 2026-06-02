'use client';

import { LogOut } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui-kit';

interface UserSettingsProps {
  readonly email: string;
  readonly name?: string;
  readonly avatar?: string;
  readonly className?: string;
  readonly disabled?: boolean;

  readonly onLogout?: () => void;
}

function UserSettingsView({ email, name, avatar, className, disabled, onLogout }: UserSettingsProps) {
  const AvatarComponent = (
    <Avatar className={className}>
      <AvatarImage src={avatar} alt={name} />
      <AvatarFallback>{email.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );

  return (
    <DropdownMenu modal>
      <DropdownMenuTrigger asChild>{AvatarComponent}</DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            {AvatarComponent}

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-xs">{email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled={disabled} onClick={onLogout}>
          <LogOut />
          Выход
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserSettingsView, type UserSettingsProps };
