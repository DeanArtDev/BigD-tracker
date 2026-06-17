import type { ComponentProps, PropsWithChildren } from 'react';
import { DropdownMenuItem } from '@/shared/ui-kit';

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
