import type { TimeEvent, TimeViewEvent } from '@/shared/lib/time-view/core';
import { useMemo } from 'react';
import { useTimeViewController } from '../context';

function useEventsState<TExtra extends { id: number }>({
  events,
}: {
  events: TimeViewEvent<TExtra>[];
}) {
  const controller = useTimeViewController<TExtra>();

  return useMemo(() => {
    return controller
      .getEventViews(events)
      .reduce<{ eventList: TimeEvent<TExtra>[]; allDayEvents: TimeEvent<TExtra>[] }>(
        (acc, item) => {
          if (item.isAllDay(controller.state.selectedDate.toDate())) {
            acc.allDayEvents.push(item);
          } else {
            acc.eventList.push(item);
          }
          return acc;
        },
        { eventList: [], allDayEvents: [] },
      );
  }, [events, controller]);
}

export { useEventsState };
