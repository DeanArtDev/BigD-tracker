import { AppLoader } from '@/shared/ui-kit/ui/app-loader';
import { Card } from '@/shared/ui-kit/ui/card';
import { cn } from '@/shared/ui-kit/utils';
import { GripVertical } from 'lucide-react';

interface CalendarContentViewProps {
  readonly bgcolor?: string;
  readonly title: string;
  readonly isDraggable: boolean;
  readonly isLoading: boolean;
}

function CalendarContentView({ bgcolor, title, isDraggable, isLoading }: CalendarContentViewProps) {
  return (
    <Card
      className={cn(
        'flex flex-row justify-between gap-2 items-center text-xs p-1 rounded-md relative overflow-hidden h-[40px] md:h-full',
        bgcolor,
        {
          'before:absolute before:inset-0 before:bg-white/70 before:opacity-70 before:z-0':
            isLoading,
        },
      )}
    >
      <span className="hidden lg:inline-block w-full text-left md:text-center wrap-anywhere whitespace-normal">
        {title}
      </span>
      <AppLoader
        className={cn('absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2', {
          hidden: !isLoading,
        })}
        size={20}
      />
      {isDraggable && (
        <GripVertical className="relative m-auto lg:ml-auto lg:right-[-5px]" size={20} />
      )}
    </Card>
  );
}

export { CalendarContentView, type CalendarContentViewProps };
