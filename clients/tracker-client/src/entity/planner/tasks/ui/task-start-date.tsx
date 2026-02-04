import { cn } from '@/shared/ui-kit/utils';
import { Calendar } from 'lucide-react';
import type { ComponentProps } from 'react';
import { isDateInTodayAndTomorrow } from '../lib/utils';
import dayjs from '@/shared/lib/time';

type ThingStartDateProps = ComponentProps<typeof Calendar> & {
  readonly startDate?: Date;
  readonly showDate?: boolean;
};

function TaskStartDate({ startDate, showDate = false, ...svgProps }: ThingStartDateProps) {
  if (startDate == null) return null;

  const isWarning = isDateInTodayAndTomorrow(startDate);

  return (
    <span
      className={cn('flex flex-wrap gap-1.5 items-center', {
        [`text-destructive font-bold`]: isWarning,
      })}
    >
      <Calendar color={isWarning ? 'var(--destructive)' : undefined} {...svgProps} />
      {showDate && dayjs(startDate).format('D MMM')}
    </span>
  );
}

export { TaskStartDate, type ThingStartDateProps };
