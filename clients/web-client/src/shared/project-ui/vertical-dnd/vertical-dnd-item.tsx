'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CSSProperties } from 'react';
import type { HasId } from '@/shared/lib/type-helpers';
import type { HandleProps, VerticalDnDProps } from './types';

function VerticalDndItem<T extends HasId>(props: {
  item: T;
  id: number | string;
  renderItem: VerticalDnDProps<T>['renderItem'];
}) {
  const { item, id, renderItem } = props;

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const handleProps: HandleProps = {
    'ref': setActivatorNodeRef as (node: HTMLElement | null) => void,
    'className': 'cursor-grab active:cursor-grabbing select-none touch-none',
    'aria-label': 'Dragging',
    ...attributes,
    ...listeners,
  };

  return renderItem({ item, isDragging, setNodeRef, style, handleProps });
}

export { VerticalDndItem };
