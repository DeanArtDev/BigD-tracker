import { UseCalendarAppReturn, ViewType } from '@dayflow/core';
import { useCalendarApp } from '@dayflow/react';
import { PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';
import { useDiaryUrl } from '@/app/(private)/planner/diary/_model';
import timeAndDate from '@/shared/lib/time';
import { diaryCalendarContext } from './diary-calendar.context';
import { EMPTY_GROUP_ID, emptyGroup, usePlugins } from '../../model';
import { useViews, type YearViewMode } from '../../view-model/use-views';

function DiaryCalendarProvider({ children }: PropsWithChildren) {
  const calendarRef = useRef<UseCalendarAppReturn | null>(null);
  const [yearViewMode, setYearViewMode] = useState<YearViewMode>('fixed-week');

  const getApp = useCallback(() => calendarRef.current?.app, []);
  const plugins = usePlugins({ getApp });
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
    calendars: [emptyGroup],
    timeFormat: '24h',
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
