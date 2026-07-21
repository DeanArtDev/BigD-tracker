'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMemo } from 'react';
import type { HasId } from '@/shared/lib/type-helpers';
import { cn } from '@/shared/ui-kit';
import type { VerticalDnDProps } from './types';
import { VerticalDndItem } from './vertical-dnd-item';

function VerticalDnD<T extends HasId>(props: VerticalDnDProps<T>) {
  const { items, onChange, renderItem, className, activationDistance = 0, getId } = props;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: activationDistance },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 8,
      },
    }),
  );

  const ids = useMemo(() => items.map((it) => (getId ? getId(it) : it.id)), [items, getId]);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;
    const oldIndex = ids.findIndex((x) => x === active.id);
    const newIndex = ids.findIndex((x) => x === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onChange({ items: arrayMove(items, oldIndex, newIndex), oldIndex, newIndex });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className={cn('flex flex-col', className)}>
          {items.map((item, idx) => {
            const id = ids[idx];

            return <VerticalDndItem<T> key={id} id={id} item={item} renderItem={renderItem} />;
          })}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

export { VerticalDnD };
