import { createAllDayEvent, createEvent, UseCalendarAppReturn, ViewType } from '@dayflow/core';
import { useCalendarApp } from '@dayflow/react';
import { PropsWithChildren, useMemo, useRef, useState } from 'react';
import timeAndDate from '@/shared/lib/time';
import { EMPTY_GROUP_ID, emptyGroup, useCallbacks, usePlugins } from '../model';
import { diaryCalendarContext } from './context';
import { type YearViewMode, useViews } from '../view-model/use-views';

function DiaryCalendarProvider({ children }: PropsWithChildren) {
  const calendarRef = useRef<UseCalendarAppReturn | null>(null);
  const [yearViewMode, setYearViewMode] = useState<YearViewMode>('fixed-week');

  const plugins = usePlugins();
  const views = useViews({ yearViewMode });
  const callbacks = useCallbacks({ calendar: calendarRef.current });

  const calendar = useCalendarApp({
    locale: 'ru-RU',
    callbacks,
    views,
    plugins,
    defaultView: ViewType.DAY,
    eventDetailTrigger: 'dbClick',
    useEventDetailDialog: true,

    calendars: [
      emptyGroup,
      {
        id: '333',
        name: 'New',
        colors: {
          lineColor: 'red',
          eventColor: 'red',
          eventSelectedColor: 'color-mix(in oklab, red 40%, transparent)',
          textColor: 'var(--foreground)',
        },
      },
    ],
    events: [
      createEvent({
        id: '1',
        title: 'Team Meeting',
        start: timeAndDate('2026-08-02T10:00').toDate(),
        end: timeAndDate('2026-07-31T11:00').toDate(),
        calendarId: EMPTY_GROUP_ID,
        description: 'Team Meeting',
      }),
      createEvent({
        id: '3',
        title: 'Team Meeting2',
        start: timeAndDate('2026-08-02T10:00').toDate(),
        end: timeAndDate('2026-08-03T11:00').toDate(),
        calendarId: EMPTY_GROUP_ID,
        description: 'Team Meeting',
      }),
      createEvent({
        id: 'multi-day-timed-example',
        title: 'Multi-day timed event',
        start: timeAndDate('2026-08-02T12:00').toDate(),
        end: timeAndDate('2026-08-02T14:00').toDate(),
        calendarId: EMPTY_GROUP_ID,
        description: '30 июля 12:00 → 31 июля 10:00',
      }),
      createAllDayEvent({
        id: '2',
        title: 'Conference',
        start: timeAndDate('2026-08-02').toDate(),
        calendarId: EMPTY_GROUP_ID,
      }),
      createAllDayEvent({
        id: '4',
        title: 'Conference2',
        start: timeAndDate('2026-08-02').toDate(),
        calendarId: EMPTY_GROUP_ID,
      }),
    ],
    initialDate: timeAndDate().toDate(),
  });
  calendarRef.current = calendar;

  return (
    <diaryCalendarContext.Provider
      value={useMemo(() => ({ calendar, setYearViewMode, yearViewMode }), [calendar, yearViewMode])}
    >
      {children}
    </diaryCalendarContext.Provider>
  );
}

export { DiaryCalendarProvider };
