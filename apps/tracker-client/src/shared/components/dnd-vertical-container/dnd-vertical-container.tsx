import { type JSX } from 'react';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { type ItemRenderProps, SortableItem } from './sortable-item';
import type { HasId } from '@/shared/lib/type-helpers';

interface DndVerticalContainerProps<TItem extends HasId> {
  readonly items: TItem[];
  readonly itemRender: (renderProps: ItemRenderProps<TItem> & { index: number }) => JSX.Element;
  readonly computeKey?: (item: TItem) => string;

  readonly onElementsSort: (data: { items: TItem[]; oldIndex: number; newIndex: number }) => void;
}

function DndVerticalContainer<TItem extends HasId>(props: DndVerticalContainerProps<TItem>) {
  const { items, computeKey, itemRender, onElementsSort } = props;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over != null && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      onElementsSort({ oldIndex, newIndex, items: arrayMove(items, oldIndex, newIndex) });
    }
  };

  return (
    <DndContext
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((item, index) => (
          <SortableItem
            key={computeKey?.(item) ?? item.id}
            item={item}
            itemRender={(renderProps) => itemRender({ ...renderProps, index })}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

export { DndVerticalContainer, type DndVerticalContainerProps };
