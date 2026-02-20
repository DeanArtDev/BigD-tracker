import { cn } from '@/shared/ui-kit/utils';
import { CalendarClock } from 'lucide-react';
import type { ComponentProps } from 'react';
import { isDateInTodayAndTomorrow } from '../lib/utils';
import dayjs from '@/shared/lib/time';

type TaskDeadlineDateProps = ComponentProps<typeof CalendarClock> & {
  readonly deadline?: Date;
  readonly showDate?: boolean;
  readonly warningIndication?: boolean;
};

function TaskDeadlineDate({
  deadline,
  warningIndication = true,
  showDate = false,
  ...svgProps
}: TaskDeadlineDateProps) {
  if (deadline == null) return null;

  const isWarning = isDateInTodayAndTomorrow(deadline) && warningIndication;
  return (
    <span
      className={cn('flex flex-wrap gap-1.5 items-center', {
        [`text-destructive font-bold`]: isWarning,
      })}
    >
      <CalendarClock color={isWarning ? 'var(--destructive)' : undefined} {...svgProps} />
      {showDate && dayjs(deadline).format('D MMM')}
    </span>
  );
}

export { TaskDeadlineDate, type TaskDeadlineDateProps };
