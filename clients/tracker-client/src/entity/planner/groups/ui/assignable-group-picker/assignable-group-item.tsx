import { Item, ItemContent, ItemMedia, ItemTitle } from '@/shared/ui-kit/ui/item';
import { cn } from '@/shared/ui-kit/utils';
import type { ReactNode } from 'react';
import type { GroupInfoEntity } from '../../model';

interface AssignableGroupItemProps {
  readonly item: GroupInfoEntity;
  readonly actionSlot?: ReactNode;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly onClick: () => void;
}

function AssignableGroupItem({
  item,
  disabled,
  className,
  actionSlot,
  onClick,
}: AssignableGroupItemProps) {
  return (
    <Item
      className={cn('min-w-0 w-auto', className, {
        'hover:cursor-pointer hover:bg-gray-100': !disabled,
      })}
      variant={disabled ? 'muted' : 'outline'}
      size="xs"
      onClick={() => {
        if (!disabled) onClick();
      }}
    >
      <ItemContent className="w-full min-w-0">
        <ItemTitle
          className={cn('flex line-clamp-1 break-all min-w-0 ', { 'text-gray-500': disabled })}
        >
          {item.name}
        </ItemTitle>
      </ItemContent>

      {actionSlot != null && <ItemMedia>{actionSlot}</ItemMedia>}
    </Item>
  );
}

export { AssignableGroupItem, type AssignableGroupItemProps };
