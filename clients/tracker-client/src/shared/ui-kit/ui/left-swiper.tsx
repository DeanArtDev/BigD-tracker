import { type PropsWithChildren, type ReactNode, useEffect, useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, useDraggable } from '@dnd-kit/core';

interface LeftSwiperProps {
  readonly id: string;
  readonly openId?: string;
  readonly setOpenId?: (openId?: string) => void;
  readonly children: (props: { reset: () => void }) => ReactNode;
  readonly content: (props: { reset: () => void }) => ReactNode;
  readonly actionsSpace?: number;
}

export const LeftSwiper = ({
  id,
  openId,
  setOpenId,
  children,
  content,
  actionsSpace = 128,
}: LeftSwiperProps) => {
  const [offsetX, setOffsetX] = useState(0);

  useEffect(() => {
    if (openId !== id && offsetX !== 0) setOffsetX(0);
  }, [openId, id, offsetX]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  const reset = () => {
    setOffsetX(0);
    if (openId === id) setOpenId?.(undefined);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={() => void setOpenId?.(id)}
      onDragMove={({ delta }) => {
        setOffsetX((prev) => {
          const next = Math.max(prev + delta.x, -180);
          return Math.min(0, next);
        });
      }}
      onDragEnd={({ delta }) => {
        if (delta.x < -100) {
          setOffsetX(-actionsSpace);
          setOpenId?.(id);
        } else {
          reset();
        }
      }}
      onDragCancel={reset}
    >
      <SwipeableItem draggableId={`swipe-${id}`} offsetX={offsetX} content={content({ reset })}>
        {children({ reset })}
      </SwipeableItem>
    </DndContext>
  );
};

const SwipeableItem = ({
  draggableId,
  offsetX,
  children,
  content,
}: PropsWithChildren<{ draggableId: string; offsetX: number; content: ReactNode }>) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: draggableId });

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 h-full flex ml-auto">{content}</div>

      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="touch-pan-y select-none"
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
