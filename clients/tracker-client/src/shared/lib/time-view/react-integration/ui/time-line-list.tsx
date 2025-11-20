import { type Dayjs } from '@/shared/lib/time';
import { type ReactNode, useMemo } from 'react';
import { useDayTimeLinePeriodsState, useSelectedDateState } from '../model/selectors';
import { CurrentTimeIndicator } from './current-time-indicator';

interface TimeLineListProps {
  readonly eventsSlot?: ReactNode;
  readonly currentDate?: Dayjs;
}

const HEIGHT = 80;
const FORMAT = 'HH:mm';

function TimeLineList({ eventsSlot }: TimeLineListProps) {
  const dayTimeLine = useDayTimeLinePeriodsState();
  const { isToday } = useSelectedDateState();

  const timeLinePeriods = useMemo(() => {
    return dayTimeLine.map((item) => ({ title: item.format(FORMAT), date: item }));
  }, [dayTimeLine]);

  return (
    <div className="overflow-auto grow min-h-0">
      <div className="relative grid grid-cols-[60px_1fr] items-stretch">
        <div className="flex flex-col">
          {timeLinePeriods.map((item, index) => {
            return (
              <div
                key={item.title + index}
                style={{ minHeight: HEIGHT }}
                className="time-line_item justify-center flex first:border-t border-b border-gray-300 p-2 pt-0 pl-0"
              >
                <span className="text-sm">{item.title}</span>
              </div>
            );
          })}
        </div>

        <div className="time-line relative min-h-0 grid-rows-[1fr]">
          {timeLinePeriods.map((_, index) => {
            return (
              <div key={index} style={{ minHeight: HEIGHT }} className="first:border-t border-b border-gray-300" />
            );
          })}

          {eventsSlot}
        </div>

        {isToday && <CurrentTimeIndicator />}
      </div>
    </div>
  );
}

export { TimeLineList, type TimeLineListProps };
