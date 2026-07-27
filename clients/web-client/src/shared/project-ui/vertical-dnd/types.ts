import type { CSSProperties, ReactNode, Ref } from 'react';
import type { HasId } from '@/shared/lib/type-helpers';

interface HandleProps {
  'ref': (node: HTMLElement | null) => void;
  'className'?: string;
  'aria-label'?: string;
  [key: string]: unknown;
}

interface VerticalDndItemRenderProps<TElement extends Element> {
  readonly style: CSSProperties;
  readonly ref?: Ref<TElement>;
}

interface VerticalDnDProps<T extends HasId> {
  readonly items: T[];
  readonly onChange: (data: { items: T[]; newIndex: number; oldIndex: number }) => void;
  readonly renderItem: (args: {
    readonly item: T;
    readonly isDragging: boolean;
    readonly style: CSSProperties;
    readonly setNodeRef: (node: HTMLElement | null) => void;
    readonly handleProps: HandleProps;
  }) => ReactNode;
  readonly className?: string;
  readonly disabledDragging?: boolean;

  /** Чтобы не стартовать dnd от лёгкого тапа/скролла */
  readonly activationDistance?: number;

  /** Позволяет кастомно получить id (если у тебя не `item.id`) */
  readonly getId?: (item: T) => string | number;
}

export type { VerticalDnDProps, HandleProps, VerticalDndItemRenderProps };
