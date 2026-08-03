import { CalendarCallbacks, CalendarType, Event, EventChange, ViewType } from '@dayflow/core';
import { useEffect, useMemo } from 'react';
import { useDiaryUrl } from '@/app/(private)/planner/diary/_model';
import { MaybePromise } from '@/shared/lib';
import { useIsMounted } from '@/shared/lib/application-status';
import timeAndDate from '@/shared/lib/time';
import { useDiaryContext, useDiaryDialogContext } from '../../context';
import { diaryViewRangeMap } from '../constants';
import { DiaryDialogActions } from '../diary-dialog-actions';
import { DiaryEvent } from '../types';

function withDiaryEvent(callback: (event: DiaryEvent) => MaybePromise<void>): (event: Event) => MaybePromise<void> {
  return (event) => callback(DiaryDialogActions.withTaskMeta(event));
}

function useCallbacks() {
  const { calendar } = useDiaryContext();
  const { openDiaryDialog } = useDiaryDialogContext();
  const [, setDiarySearch] = useDiaryUrl();

  const app = calendar?.app;

  const callbacks = useMemo<CalendarCallbacks>(
    () => ({
      onEventCreate: withDiaryEvent(async (event) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 500);
        });
        console.log('create event:', event);
      }),
      onEventClick: (event: Event) => {
        console.log('click event:', event);
      },
      onEventDoubleClick: (event: Event) => {
        console.log('double click event:', event);
        openDiaryDialog(event);
        return false;
      },
      onEventUpdate: withDiaryEvent(async (event) => {
        console.log('update event:', event);
      }),
      onEventDelete: async (eventId: string) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
        console.log('delete event:', eventId);
      },
      onMoreEventsClick: (date: Date) => {
        console.log('more events click date:', date);
        app.selectDate(date);
        app.changeView(ViewType.DAY);
      },
      onCalendarUpdate: async (cal: CalendarType) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
        console.log('update calendar:', cal);
      },
      onCalendarDelete: async (calendarId: string) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
        console.log('delete calendar:', calendarId);
      },
      onCalendarCreate: async (cal: CalendarType) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
        console.log('create calendar: w', cal);
      },
      onCalendarMerge: async (sourceId: string, targetId: string) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
        console.log('merge calendar:', sourceId, targetId);
      },
      onEventBatchChange: (event: EventChange[]) => {
        console.log('batch change events:', event);
      },
    }),
    [app, openDiaryDialog],
  );

  useEffect(() => {
    app.updateConfig({ callbacks });
  }, [app, callbacks]);

  const isMounted = useIsMounted();
  useEffect(() => {
    const unsubscribe = app.subscribeVisibleRangeChange(({ end, start, view }) => {
      setDiarySearch((prev) => ({
        ...prev,
        view: view as ViewType,
        from: timeAndDate(start).format('YYYY-MM-DD'),
        to: timeAndDate(end).format('YYYY-MM-DD'),
      }));
    });

    if (!isMounted) {
      const type = app.getCurrentView().type as ViewType;
      if (type === ViewType.RESOURCE) return;
      const currentDate = timeAndDate();
      const { from, to } = diaryViewRangeMap[type](currentDate);
      app.emitVisibleRange(timeAndDate(from).toDate(), timeAndDate(to).toDate());
    }

    return unsubscribe;
  }, [app, isMounted, setDiarySearch]);
}

export { useCallbacks };
