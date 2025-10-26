import { useContainerScrollSizeObserver } from '@/shared/ui-kit/helpers';
import { type Dayjs } from '@/shared/lib/time';
import { type ReactNode, useMemo } from 'react';
import { useDayTimeLinePeriod, useSelectedDate } from '../model/selectors';
import { CurrentTimeIndicator } from './current-time-indicator';

interface TimeLineListProps {
  readonly afterEndSlot?: ReactNode;
  readonly currentDate?: Dayjs;
}

const HEIGHT = 80;
const FORMAT = 'HH:mm';

function TimeLineList({ afterEndSlot }: TimeLineListProps) {
  const dayTimeLine = useDayTimeLinePeriod();
  const { isToday } = useSelectedDate();

  const { ref, height = 0, width = 0 } = useContainerScrollSizeObserver<HTMLDivElement>();

  const timeLinePeriods = useMemo(() => {
    return dayTimeLine.map((item) => ({ title: item.format(FORMAT), date: item }));
  }, [dayTimeLine]);

  return (
    <div className="relative overflow-auto grid grid-cols-[60px_1fr]" ref={ref}>
      <div className="flex flex-col">
        {timeLinePeriods.map((item, index) => {
          return (
            <div
              key={item.title + index}
              style={{ height: HEIGHT }}
              className="time-line_item justify-center flex border-t border-gray-300 p-2 pt-0 pl-0"
            >
              <span className="text-sm">{item.title}</span>
            </div>
          );
        })}
      </div>

      <div className="time-line relative">
        {timeLinePeriods.map((_, index) => {
          return (
            <div key={index} style={{ height: HEIGHT }} className="border-t border-gray-300" />
          );
        })}

        {afterEndSlot}
      </div>

      {isToday && <CurrentTimeIndicator container={{ width, height }} />}
    </div>
  );
}

export { TimeLineList, type TimeLineListProps };
