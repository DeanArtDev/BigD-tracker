'use client';

import { Inbox } from 'lucide-react';
import { ReactNode } from 'react';
import { cn, Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui-kit';

interface DataEmptyElementProps {
  readonly title?: ReactNode;
  readonly size?: 'md' | 'sm';
  readonly description?: ReactNode;
  readonly className?: string;
  readonly icon?: ReactNode;
}

function DataEmptyElement({
  title = 'Тут пока пусто',
  description,
  className,
  size = 'md',
  icon = <Inbox className="size-7 text-muted-foreground" strokeWidth={2} />,
}: DataEmptyElementProps) {
  const isSizeMd = size === 'md';
  const isSizeSm = size === 'sm';

  return (
    <Empty
      className={cn('flex  items-center justify-center px-4', className, {
        'min-h-[460px] w-full': isSizeMd,
        'min-h-fit': isSizeSm,
      })}
    >
      <EmptyHeader>
        {icon != null && (
          <EmptyMedia className={cn('rounded-xl bg-muted', { 'size-15': isSizeMd, 'size-10': isSizeSm })}>
            {icon}
          </EmptyMedia>
        )}

        <EmptyTitle>{title}</EmptyTitle>

        <EmptyDescription className="max-w-[280px] text-pretty">{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export { DataEmptyElement, type DataEmptyElementProps };
