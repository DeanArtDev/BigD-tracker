import { timeAndDate } from '@big-d/time';
import { ICalendarApp, ViewType } from '@dayflow/core';
import { useCalendarApp } from '@dayflow/react';
import { PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';
import { useDiaryUrl } from '@/app/(private)/planner/diary/_model';
import { diaryCalendarContext } from './diary-calendar.context';
import { EMPTY_GROUP_ID, emptyGroup, usePlugins } from '../../model';
import { useViews, type YearViewMode } from '../../view-model/use-views';

function DiaryCalendarProvider({ children }: PropsWithChildren) {
  const appRef = useRef<ICalendarApp>(undefined);
  const [yearViewMode, setYearViewMode] = useState<YearViewMode>('fixed-week');

  const getApp = useCallback(() => appRef.current, []);
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
  appRef.current = calendar.app;

  return (
    <diaryCalendarContext.Provider
      value={useMemo(() => ({ app: calendar.app, setYearViewMode, yearViewMode }), [calendar.app, yearViewMode])}
    >
      {children}
    </diaryCalendarContext.Provider>
  );
}

export { DiaryCalendarProvider };
