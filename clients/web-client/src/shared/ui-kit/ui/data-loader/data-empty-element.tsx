'use client';

import { Inbox } from 'lucide-react';
import { ReactNode } from 'react';
import { cn, Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui-kit';

type DataEmptyElementProps = {
  readonly title?: ReactNode;
  readonly description?: ReactNode;
  readonly className?: string;
  readonly icon?: ReactNode;
};

function DataEmptyElement({
  title = 'Тут пока пусто',
  description,
  className,
  icon = <Inbox className="size-7 text-muted-foreground" strokeWidth={2} />,
}: DataEmptyElementProps) {
  return (
    <Empty className={cn('flex min-h-[460px] w-full items-center justify-center px-4', className)}>
      <EmptyHeader>
        <EmptyMedia className="size-15 rounded-xl bg-muted">{icon}</EmptyMedia>

        <EmptyTitle>{title}</EmptyTitle>

        <EmptyDescription className="max-w-[280px] text-pretty">{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export { DataEmptyElement, type DataEmptyElementProps };
