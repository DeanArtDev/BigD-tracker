import { DropdownMenuItem } from '@/shared/ui-kit/ui/dropdown-menu';
import type { ComponentProps, PropsWithChildren } from 'react';

type DropdownItemProps = ComponentProps<typeof DropdownMenuItem>;

function DropdownItem({ onClick, ...props }: PropsWithChildren<DropdownItemProps>) {
  return (
    <DropdownMenuItem
      {...props}
      onClick={(evt) => {
        evt.stopPropagation();
        onClick?.(evt);
      }}
    />
  );
}

export { DropdownItem, type DropdownItemProps };
