import type {
  TimeEvent,
  TimeViewControllerOptions,
  TimeViewDateSet,
} from '@/shared/lib/time-view/core';
import type { DeepPartial } from '@/shared/lib/type-helpers';
import { type JSX, useEffect, useEffectEvent } from 'react';
import { TimeViewControllerProvider } from './model';
import { useSelectedDateState } from './model/selectors';
import { EventList, NavBar, TimeLineList } from './ui';

interface TimeViewEvent<TExtra = any> {
  readonly name: string;
  readonly to: number | Date;
  readonly from: number | Date;
  readonly extra?: TExtra;
}

interface TimeViewProps<TExtra extends { id: number }> {
  readonly events: TimeViewEvent<TExtra>[];
  readonly options?: DeepPartial<TimeViewControllerOptions>;

  readonly onDateChange?: (date: TimeViewDateSet) => void;
  readonly onEventClick?: (event: TimeEvent<TExtra>) => void;

  readonly renderEvent?: (props: { event: TimeEvent<TExtra> }) => JSX.Element;
  readonly renderALlDayEvent?: (props: { event: TimeEvent<TExtra> }) => JSX.Element;
}

function Component<TExtra extends { id: number }>(props: TimeViewProps<TExtra>) {
  const { events, onEventClick, onDateChange, renderEvent, renderALlDayEvent } = props;

  const { dateSet } = useSelectedDateState();

  const onDateChangeEvent = useEffectEvent((date: TimeViewDateSet) => onDateChange?.(date));
  useEffect(() => {
    onDateChangeEvent(dateSet);
  }, [dateSet]);

  return (
    <div className="time-view flex flex-col flex-1 min-h-0 gap-2">
      <NavBar<TExtra> events={events} renderEvent={renderALlDayEvent} onEventClick={onEventClick} />

      <div className="flex flex-col flex-1 min-h-0">
        <TimeLineList
          eventsSlot={
            <EventList<TExtra>
              events={events}
              renderEvent={renderEvent}
              onEventClick={onEventClick}
            />
          }
        />
      </div>
    </div>
  );
}

function TimeView<TExtra extends { id: number }>({ options, ...props }: TimeViewProps<TExtra>) {
  return (
    <TimeViewControllerProvider options={options}>
      <Component<TExtra> {...props} />
    </TimeViewControllerProvider>
  );
}

export { TimeView, type TimeViewProps };
