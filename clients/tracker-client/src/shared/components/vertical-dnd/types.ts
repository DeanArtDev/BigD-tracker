import type { HasId } from '@/shared/lib/type-helpers';
import type { CSSProperties, ReactNode, Ref } from 'react';

interface HandleProps {
  ref: (node: HTMLElement | null) => void;
  className?: string;
  'aria-label'?: string;
  // spread these:
  [key: string]: any;
}

interface VerticalDndItemRenderProps<TElement extends Element> {
  readonly style: CSSProperties;
  readonly ref?: Ref<TElement>;
}

interface VerticalDnDProps<T extends HasId> {
  /** Контролируемые элементы */
  items: T[];
  /** Коллбек с новым порядком после dnd */
  onChange: (data: { items: T[]; newIndex: number; oldIndex: number }) => void;

  /** Рендер строки (вся строка) */
  renderItem: (args: {
    item: T;
    isDragging: boolean;
    style: CSSProperties;
    setNodeRef: (node: HTMLElement | null) => void;
    handleProps: HandleProps;
  }) => ReactNode;

  /**
   * Рендер ручки. Важно: ВНУТРИ ты обязан повесить props `handleProps` на элемент ручки.
   * Это делает drag только за ручку.
   */
  /** Классы контейнера ul */
  className?: string;

  /** Чтобы не стартовать dnd от лёгкого тапа/скролла */
  activationDistance?: number;

  disableInteractiveElementBlocking?: boolean;

  /** Позволяет кастомно получить id (если у тебя не `item.id`) */
  getId?: (item: T) => string | number;
}

export type { VerticalDnDProps, HandleProps, VerticalDndItemRenderProps };
