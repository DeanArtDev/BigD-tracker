import { createAllDayEvent, createEvent, UseCalendarAppReturn, ViewType } from '@dayflow/core';
import { useCalendarApp } from '@dayflow/react';
import { PropsWithChildren, useMemo, useRef, useState } from 'react';
import timeAndDate from '@/shared/lib/time';
import { useCallbacks, usePlugins } from '../model';
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
    eventDetailTrigger: 'click',
    useEventDetailDialog: true,
    useEventDetailPanel: false,

    calendars: [
      ...new Array(40).fill(null).map((_, i) => ({
        id: `work ${i}`,
        name: 'WorkWorkWorkWorkWorkWorkWorkWorkWorkWorkWorkWorkWorkWorkWorkWorkWorkWorkWorkWork',
        description: 'fdslfjds',
        source: 'Цель 1',
        colors: {
          lineColor: '#2563eb',
          eventColor: '#dbeafe',
          eventSelectedColor: '#bfdbfe',
          textColor: '#1e3a8a',
        },
      })),

      {
        id: 'home',
        name: 'Home',
        icon: '😁',
        source: 'Цель 1',
        colors: {
          lineColor: 'red',
          eventColor: '#dbeafe',
          eventSelectedColor: '#bfdbfe',
          textColor: '#1e3a8a',
        },
      },
    ],
    events: [
      createEvent({
        id: '1',
        title: 'Team Meeting',
        start: timeAndDate('2026-07-30T10:00').toDate(),
        end: timeAndDate('2026-07-31T11:00').toDate(),
        calendarId: 'work 1',
        description: 'Team Meeting',
      }),
      createEvent({
        id: '3',
        title: 'Team Meeting2',
        start: timeAndDate('2026-07-31T10:00').toDate(),
        end: timeAndDate('2026-08-01T11:00').toDate(),
        calendarId: 'work 1',
        description: 'Team Meeting',
      }),
      createEvent({
        id: 'multi-day-timed-example',
        title: 'Multi-day timed event',
        start: timeAndDate('2026-07-30T12:00').toDate(),
        end: timeAndDate('2026-07-31T10:00').toDate(),
        calendarId: 'work 1',
        description: '30 июля 12:00 → 31 июля 10:00',
      }),
      createAllDayEvent({
        id: '2',
        title: 'Conference',
        start: timeAndDate('2026-07-31').toDate(),
        calendarId: 'work 1',
      }),
      createAllDayEvent({
        id: '4',
        title: 'Conference2',
        start: timeAndDate('2026-07-31').toDate(),
        calendarId: 'work 1',
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
