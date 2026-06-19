import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { cn, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui-kit';
import { DropdownItem, type DropdownItemProps } from './dropdown-item';

type TaskActionsProps = {
  readonly trigger?: ReactNode;
  readonly items?: (DropdownItemProps & { key: string })[];
  readonly className?: string;
  readonly align?: ComponentProps<typeof DropdownMenuContent>['align'];
} & ComponentProps<typeof DropdownMenu>;

function AppDropdown({
  items = [],
  trigger,
  children,
  className,
  align,
  ...dropdownProps
}: PropsWithChildren<TaskActionsProps>) {
  return (
    <DropdownMenu {...dropdownProps}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

      <DropdownMenuContent className={cn('w-fit', className)} align={align}>
        {children}
        {items.map((item) => (
          <DropdownItem {...item} key={item.key} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { AppDropdown };
