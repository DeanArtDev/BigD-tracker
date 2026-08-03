import { UseCalendarAppReturn, ViewType } from '@dayflow/core';
import { useCalendarApp } from '@dayflow/react';
import { PropsWithChildren, useMemo, useRef, useState } from 'react';
import { useDiaryUrl } from '@/app/(private)/planner/diary/_model';
import timeAndDate from '@/shared/lib/time';
import { EMPTY_GROUP_ID, emptyGroup, usePlugins } from '../model';
import { diaryCalendarContext } from './context';
import { useViews, type YearViewMode } from '../view-model/use-views';

function DiaryCalendarProvider({ children }: PropsWithChildren) {
  const calendarRef = useRef<UseCalendarAppReturn | null>(null);
  const [yearViewMode, setYearViewMode] = useState<YearViewMode>('fixed-week');
  const plugins = usePlugins();
  const views = useViews({ yearViewMode });
  const [diarySearch] = useDiaryUrl();

  const calendar = useCalendarApp({
    defaultCalendar: EMPTY_GROUP_ID,
    locale: 'ru-RU',
    views,
    plugins,
    defaultView: diarySearch?.view ?? ViewType.DAY,
    eventDetailTrigger: 'dbClick',
    useEventDetailDialog: false,
    useEventDetailPanel: false,
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
    initialDate: timeAndDate(diarySearch?.from).toDate(),
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
