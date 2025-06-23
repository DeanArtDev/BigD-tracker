import { type JSX } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DndItem, ItemRenderProps } from './types';

interface SortableItemProps<TItem extends DndItem> {
  readonly item: TItem;
  readonly itemRender?: (props: ItemRenderProps<TItem>) => JSX.Element;
}

function SortableItem<TItem extends DndItem>(props: SortableItemProps<TItem>) {
  const { item, itemRender } = props;

  const { attributes, listeners, setNodeRef, transform, transition, isSorting, isDragging } =
    useSortable({
      id: item.moveId,
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

export { SortableItem };
