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
import { SortableItem } from './sortable-item';
import type { DndItem, ItemRenderProps } from './types';

interface DndVerticalContainerProps<TItem extends DndItem> {
  readonly items: TItem[];
  readonly itemRender: (renderProps: ItemRenderProps<TItem> & { index: number }) => JSX.Element;

  readonly onElementsSort: (data: { items: TItem[]; oldIndex: number; newIndex: number }) => void;
}

function DndVerticalContainer<TItem extends DndItem>(props: DndVerticalContainerProps<TItem>) {
  const { items, itemRender, onElementsSort } = props;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over != null && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.moveId === active.id);
      const newIndex = items.findIndex((i) => i.moveId === over.id);

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
      <SortableContext items={items.map((i) => i.moveId)} strategy={verticalListSortingStrategy}>
        {items.map((item, index) => {
          return (
            <SortableItem
              key={item.moveId}
              item={item}
              itemRender={(renderProps) => itemRender({ ...renderProps, index })}
            />
          );
        })}
      </SortableContext>
    </DndContext>
  );
}

export { DndVerticalContainer, type DndVerticalContainerProps };
