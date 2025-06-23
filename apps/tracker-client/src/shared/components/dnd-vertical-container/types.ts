import { useSortable } from '@dnd-kit/sortable';

interface DndItem {
  readonly moveId: number | string;
}

type UseSortableReturnTypes = ReturnType<typeof useSortable>;

interface ItemRenderProps<TItem extends DndItem> {
  readonly item: TItem;

  readonly isSorting: UseSortableReturnTypes['isSorting'];
  readonly isDragging: UseSortableReturnTypes['isDragging'];

  readonly cssTransform: string | undefined;
  readonly cssTransition: string | undefined;
  readonly attributes: UseSortableReturnTypes['attributes'];
  readonly listeners: UseSortableReturnTypes['listeners'];

  readonly setNodeRef: UseSortableReturnTypes['setNodeRef'];
}

export type { DndItem, ItemRenderProps };
