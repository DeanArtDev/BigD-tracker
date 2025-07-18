import { type PropsWithChildren, type ReactNode, useState } from 'react';
import { DndContext, useDraggable, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';

export const LeftSwiper = ({
  children,
  actionsSpace = 128,
  actions,
}: PropsWithChildren<{ actionsSpace?: number; actions: ReactNode }>) => {
  const [offsetX, setOffsetX] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  return (
    <DndContext
      sensors={sensors}
      onDragMove={({ delta }) => {
        const next = Math.max(offsetX + delta.x, -180);
        setOffsetX(Math.min(0, next));
      }}
      onDragEnd={({ delta }) => {
        if (delta.x < -100) {
          setOffsetX(-actionsSpace);
        } else {
          setOffsetX(0);
        }
      }}
    >
      <SwipeableItem offsetX={offsetX} actions={actions}>
        {children}
      </SwipeableItem>
    </DndContext>
  );
};

const SwipeableItem = ({
  offsetX,
  children,
  actions,
}: PropsWithChildren<{ offsetX: number; actions: ReactNode }>) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: 'swipe-card' });

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 h-full flex ml-auto">{actions}</div>

      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="touch-none select-none"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: 'transform 0.3s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
};
