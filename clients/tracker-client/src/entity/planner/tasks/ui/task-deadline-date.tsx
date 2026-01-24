import { cn } from '@/shared/ui-kit/utils';
import { format } from 'date-fns';
import { CalendarClock } from 'lucide-react';
import type { ComponentProps } from 'react';
import { isDateInTodayAndTomorrow } from '../lib/utils';

type TaskDeadlineDateProps = ComponentProps<typeof CalendarClock> & {
  readonly deadline?: Date;
  readonly showDate?: boolean;
};

function TaskDeadlineDate({ deadline, showDate = false, ...svgProps }: TaskDeadlineDateProps) {
  if (deadline == null) return null;

  const isWarning = isDateInTodayAndTomorrow(deadline);
  return (
    <span
      className={cn('flex flex-wrap gap-1.5 items-center', {
        [`text-destructive font-bold`]: isWarning,
      })}
    >
      <CalendarClock color={isWarning ? 'var(--destructive)' : undefined} {...svgProps} />
      {showDate && format(deadline, 'd MMM')}
    </span>
  );
}

export { TaskDeadlineDate, type TaskDeadlineDateProps };
