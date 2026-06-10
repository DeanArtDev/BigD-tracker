import { Inbox } from 'lucide-react';
import { ReactNode } from 'react';
import { Typography } from '@/shared/ui-kit';

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
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-[70px] items-center justify-center rounded-full bg-muted">{icon}</div>

        <Typography.H3>{title}</Typography.H3>

        <Typography.Muted className="mt-4 max-w-[280px]">{description}</Typography.Muted>
      </div>
    </div>
  );
}

export { EmptyTasksPlaceholder, type EmptyTasksPlaceholderProps };
