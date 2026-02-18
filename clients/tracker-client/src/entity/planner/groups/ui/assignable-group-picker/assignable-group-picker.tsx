import type { GroupInfoEntity } from '@/entity/planner/groups/model';
import { AppEmptyPlaceholder } from '@/shared/components/app-empty-placeholder';
import {
  isStringIncludesSearch,
  useEndToEndSearch,
} from '@/shared/lib/react/use-end-to-end-search';
import { DataLoader } from '@/shared/ui-kit/ui/data-loader';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui-kit/ui/input-group';
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/shared/ui-kit/ui/item';
import { ScrollAreaNativeVertical } from '@/shared/ui-kit/ui/scroll-area-native-vertical';
import { Separator } from '@/shared/ui-kit/ui/separator';
import { cn } from '@/shared/ui-kit/utils';
import { partition } from 'lodash-es';
import { Check, Inbox, Search } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';

interface AssignableGroupPickerProps {
  readonly items: GroupInfoEntity[];
  readonly disabled?: boolean;
  readonly taskGroupId?: number;
  readonly onSelect: (item: GroupInfoEntity) => void;
  readonly onInboxSelect: (item: GroupInfoEntity) => void;
}

function AssignableGroupPicker({
  items,
  taskGroupId,
  disabled = false,
  onSelect,
  onInboxSelect,
}: AssignableGroupPickerProps) {
  const groupInfoData = useMemo(() => {
    const [inbox, rest] = partition(items, (item) => item.name === 'Inbox');
    const [pinned, others] = partition(rest, (item) => item.id === taskGroupId);

    return {
      inbox: inbox?.at(-1),
      items: [...pinned, ...others],
    };
  }, [items]);

  const { foundData, handleSearchChange } = useEndToEndSearch<GroupInfoEntity>({
    data: groupInfoData.items,
    predicates: {
      name: isStringIncludesSearch,
    },
  });

  const { inbox } = groupInfoData;
  return (
    <div className="flex flex-col grow gap-2 min-h-0 py-3">
      {inbox != null && (
        <>
          <AssignableGroupItem
            className="mx-3"
            key={inbox.id}
            item={inbox}
            actionSlot={
              <>
                {inbox.id === taskGroupId && (
                  <Check className={cn('size-4 stroke-3 ', { 'stroke-gray-500': disabled })} />
                )}
                <Inbox className={cn('size-4 stroke-3', { 'stroke-gray-500': disabled })} />
              </>
            }
            disabled={disabled}
            isSelected={inbox.id === taskGroupId}
            onClick={() => void onInboxSelect(inbox)}
          />

          <Separator />
        </>
      )}

      <ScrollAreaNativeVertical>
        <DataLoader
          isEmpty={foundData.length <= 0}
          emptyElement={<AppEmptyPlaceholder size="small" message="Группы не найдены." />}
        >
          <ul className="flex flex-col grow min-w-0 gap-2 px-3">
            {foundData.map((groupIndo) => {
              const isSelected = groupIndo?.id === taskGroupId;

              return (
                <AssignableGroupItem
                  key={groupIndo.id}
                  item={groupIndo}
                  disabled={disabled}
                  actionSlot={
                    isSelected && (
                      <Check className={cn('size-4 stroke-3 ', { 'stroke-gray-500': disabled })} />
                    )
                  }
                  isSelected={isSelected}
                  onClick={() => void onSelect(groupIndo)}
                />
              );
            })}
          </ul>
        </DataLoader>
      </ScrollAreaNativeVertical>

      <Separator className="mt-auto" />

      <div className="mx-3">
        <InputGroup>
          <InputGroupInput
            tabIndex={-1}
            disabled={disabled}
            placeholder="Поиск по группам"
            onChange={(evt) => {
              handleSearchChange(evt.target.value.trim());
            }}
          />

          <InputGroupAddon align="inline-end">
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}

interface AssignableGroupItemProps {
  readonly item: GroupInfoEntity;
  readonly actionSlot?: ReactNode;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly isSelected: boolean;
  readonly onClick: () => void;
}

function AssignableGroupItem({
  item,
  disabled,
  className,
  isSelected,
  actionSlot,
  onClick,
}: AssignableGroupItemProps) {
  return (
    <Item
      className={cn('min-w-0 w-auto', className, {
        'hover:cursor-pointer hover:bg-gray-100': !isSelected && !disabled,
      })}
      variant={disabled ? 'muted' : 'outline'}
      size="xs"
      onClick={() => {
        if (!disabled && !isSelected) onClick();
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

export { AssignableGroupPicker, type AssignableGroupPickerProps };
