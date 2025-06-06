import { useIsMobile } from '@/shared/ui-kit/hooks/use-mobile';
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
  const isMobile = useIsMobile();

  return (
    <Card
      className={cn(
        'flex flex-row justify-between gap-2 items-center text-xs p-1 rounded-md',
        bgcolor,
        { ['h-[40px]']: isMobile },
      )}
    >
      {!isMobile && (
        <span className="w-full text-center wrap-anywhere whitespace-normal">{title}</span>
      )}
      {isLoading && <AppLoader size={20} />}
      {isDraggable && (
        <GripVertical
          className={cn('relative right-[-5px]', {
            'ml-auto': isMobile,
          })}
          size={15}
        />
      )}
    </Card>
  );
}

export { CalendarContentView, type CalendarContentViewProps };
