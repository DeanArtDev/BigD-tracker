import { type JSX } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { HasId } from '@/shared/lib/type-helpers';

type UseSortableReturnTypes = ReturnType<typeof useSortable>;

interface ItemRenderProps<TItem extends HasId> {
  readonly item: TItem;

  readonly isSorting: UseSortableReturnTypes['isSorting'];
  readonly isDragging: UseSortableReturnTypes['isDragging'];

  readonly cssTransform: string | undefined;
  readonly cssTransition: string | undefined;
  readonly attributes: UseSortableReturnTypes['attributes'];
  readonly listeners: UseSortableReturnTypes['listeners'];

  readonly setNodeRef: UseSortableReturnTypes['setNodeRef'];
}

interface SortableItemProps<TItem extends HasId> {
  readonly item: TItem;
  readonly itemRender?: (props: ItemRenderProps<TItem>) => JSX.Element;
}

function SortableItem<TItem extends HasId>(props: SortableItemProps<TItem>) {
  const { item, itemRender } = props;

  const { attributes, listeners, setNodeRef, transform, transition, isSorting, isDragging } =
    useSortable({
      id: item.id,
    });

  if (itemRender == null) return <div>Implement itemRender function</div>;

  return itemRender({
    item,
    isDragging,
    isSorting,

    attributes,
    listeners,
    cssTransform: CSS.Transform.toString(transform),
    cssTransition: transition,

    setNodeRef,
  });
}

export { SortableItem, type ItemRenderProps };
