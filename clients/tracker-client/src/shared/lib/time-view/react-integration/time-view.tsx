import type { TimeViewControllerOptions, TimeViewDateSet } from '@/shared/lib/time-view/core';
import type { DeepPartial } from '@/shared/lib/type-helpers';
import { useEffect, useRef } from 'react';
import { TimeViewControllerProvider } from './model';
import { useSelectedDateState } from './model/selectors';
import { EventList, NavBar, TimeLineList } from './ui';

interface TimeViewEvent<TExtra = any> {
  readonly name: string;
  readonly to: number | Date;
  readonly from: number | Date;
  readonly extra?: TExtra;
}

function Component<TExtra extends { id: number }>({
  events,
  onDateChange,
}: {
  readonly events: TimeViewEvent<TExtra>[];
  readonly onDateChange?: (date: TimeViewDateSet) => void;
}) {
  const { dateSet } = useSelectedDateState();

  const onDateChangeRef = useRef(onDateChange);
  onDateChangeRef.current = onDateChange;
  useEffect(() => {
    onDateChangeRef.current?.(dateSet);
  }, [dateSet]);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-2">
      <NavBar<TExtra> events={events} />

      <div className="flex flex-col flex-1 min-h-0">
        <TimeLineList eventsSlot={<EventList<TExtra> events={events} />} />
      </div>
    </div>
  );
}

interface TimeViewProps<TExtra extends { id: number }> {
  readonly events: TimeViewEvent<TExtra>[];
  readonly options?: DeepPartial<TimeViewControllerOptions>;
  readonly onDateChange?: (date: TimeViewDateSet) => void;
}

function TimeView<TExtra extends { id: number }>({
  onDateChange,
  ...props
}: TimeViewProps<TExtra>) {
  return (
    <TimeViewControllerProvider options={props.options}>
      <Component<TExtra> events={props.events} onDateChange={onDateChange} />
    </TimeViewControllerProvider>
  );
}

export { TimeView, type TimeViewProps };
