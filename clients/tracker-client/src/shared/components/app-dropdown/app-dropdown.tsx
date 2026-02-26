import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/ui-kit/ui/dropdown-menu';
import { cn } from '@/shared/ui-kit/utils';
import type { PropsWithChildren, ReactNode } from 'react';
import { DropdownItem, type DropdownItemProps } from './dropdown-item';

interface TaskActionsProps {
  readonly disabled?: boolean;
  readonly trigger?: ReactNode;
  readonly items?: DropdownItemProps[];
  readonly className?: string;
}

function AppDropdown({
  items = [],
  trigger,
  children,
  className,
}: PropsWithChildren<TaskActionsProps>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

      <DropdownMenuContent className={cn('w-fit', className)}>
        {children}
        {items.map((item) => (
          <DropdownItem {...item} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { AppDropdown };
