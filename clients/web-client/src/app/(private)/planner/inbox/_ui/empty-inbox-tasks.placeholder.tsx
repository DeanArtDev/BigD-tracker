'use client';

import { Inbox } from 'lucide-react';
import { ReactNode } from 'react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui-kit';

type EmptyTasksPlaceholderProps = {
  readonly title?: string;
  readonly description?: string;
  readonly icon?: ReactNode;
};

function EmptyTasksPlaceholder({
  title = 'Тут пока тихо. Накидай что-нибудь!',
  description = 'Нажми + в шапке, чтобы добавить первую задачу.',
  icon = <Inbox className="size-7 text-muted-foreground" strokeWidth={2} />,
}: EmptyTasksPlaceholderProps) {
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

export { EmptyTasksPlaceholder, type EmptyTasksPlaceholderProps };
