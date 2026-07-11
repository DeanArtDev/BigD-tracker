'use client';

import { Inbox } from 'lucide-react';
import { ReactNode } from 'react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui-kit';

type DataEmptyElementProps = {
  readonly title?: string;
  readonly description?: string;
  readonly icon?: ReactNode;
};

function DataEmptyElement({
  title = 'Тут пока пусто',
  description,
  icon = <Inbox className="size-7 text-muted-foreground" strokeWidth={2} />,
}: DataEmptyElementProps) {
  return (
    <div className="flex min-h-[460px] w-full items-center justify-center px-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia className="size-15 rounded-xl bg-muted">{icon}</EmptyMedia>

          <EmptyTitle>{title}</EmptyTitle>

          <EmptyDescription className="max-w-[280px] text-pretty">{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

export { DataEmptyElement, type DataEmptyElementProps };
