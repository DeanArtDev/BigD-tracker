import { Typography } from './typography';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui-kit/ui/empty';
import { cn } from '@/shared/ui-kit/utils';
import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

interface AppEmptyPlaceholderProps {
  readonly size?: 'default' | 'small';
  readonly message?: string;
  readonly className?: string;
  readonly afterEndSlot?: ReactNode;
}

function AppEmptyPlaceholder({
  className,
  size = 'default',
  message = 'Данные отсутствуют',
  afterEndSlot,
}: AppEmptyPlaceholderProps) {
  return (
    <Empty className={cn('flex flex-col items-center grow justify-center text-center md:px-0', className)}>
      <EmptyHeader>
        <EmptyMedia variant={({ small: 'icon', default: 'default' } as const)[size]}>
          <TriangleAlert color="var(--color-yellow-500)" size={{ small: 30, default: 50 }[size]} />
        </EmptyMedia>

        <EmptyTitle>
          <Typography.Muted className={cn('', { small: '', default: 'text-md' }[size])}>{message}</Typography.Muted>
        </EmptyTitle>

        <EmptyDescription />
      </EmptyHeader>

      {afterEndSlot != null && <EmptyContent>{afterEndSlot}</EmptyContent>}
    </Empty>

    // <div
    //   className={cn(
    //     'flex flex-col items-center grow justify-center text-center',
    //     { small: 'gap-1', default: 'gap-3' }[size],
    //     className,
    //   )}
    // >
    //   <TriangleAlert color="var(--color-yellow-500)" size={{ small: 30, default: 50 }[size]} />
    //
    //   <Typography.Muted className={cn('', { small: '', default: 'text-md' }[size])}>
    //     {message}
    //   </Typography.Muted>
    //
    //   {afterEndSlot}
    // </div>
  );
}

export { AppEmptyPlaceholder, type AppEmptyPlaceholderProps };
