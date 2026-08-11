'use client';

import type { EventContentSlotArgs, GridContextMenuSlotArgs } from '@dayflow/core';
import { DayFlowCalendar } from '@dayflow/react';
import { useCallback, useRef } from 'react';
import { DiaryCalendarProvider, DiaryCutCopyPasteProvider, DiaryDialogProvider, useDiaryContext } from './context';
import { useGetGroupsToDiaryCalendarsSync, useGetTaskToDiaryEventsSync, useYearWorkaround } from './model';
import {
  useCallbacks,
  useChangeRangeWatch,
  useEventCreateSubscription,
  useEventUpdateSubscription,
} from './model/callbacks';
import { DiaryEventCard, DiaryEventContextMenu, DiaryGridContextMenu, YearViewModeTabs } from './ui';
import { useDiaryCalendarSearch } from './view-model';

import './style.scss';

function Component() {
  const { calendar } = useDiaryContext();
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const calendarSearch = useDiaryCalendarSearch({ containerRef: calendarContainerRef });

  useYearWorkaround({ calendar, containerRef: calendarContainerRef });

  useGetTaskToDiaryEventsSync();
  useGetGroupsToDiaryCalendarsSync();
  useCallbacks();
  useChangeRangeWatch();
  useEventCreateSubscription();
  useEventUpdateSubscription();

  const renderGridContextMenu = useCallback(
    (props: GridContextMenuSlotArgs) => <DiaryGridContextMenu {...props} />,
    [],
  );
  const renderYearViewModeTabs = useCallback(() => <YearViewModeTabs />, []);
  const renderEventContent = useCallback(
    (props: EventContentSlotArgs) => <DiaryEventCard {...props} app={calendar.app} />,
    [calendar.app],
  );

  return (
    <div ref={calendarContainerRef} className="diary-calendar flex min-h-0 min-w-0 w-full grow p-2">
      <DayFlowCalendar
        calendar={calendar}
        eventContentAllDayDay={renderEventContent}
        eventContentAllDayMonth={renderEventContent}
        eventContentAllDayWeek={renderEventContent}
        eventContentAllDayYear={renderEventContent}
        eventContentDay={renderEventContent}
        eventContentMonth={renderEventContent}
        eventContentWeek={renderEventContent}
        eventContentYear={renderEventContent}
        gridContextMenu={renderGridContextMenu}
        yearViewModeTabs={renderYearViewModeTabs}
        search={calendarSearch}
      />
      <DiaryEventContextMenu containerRef={calendarContainerRef} />
    </div>
  );
}

function DiaryCalendar() {
  return (
    <DiaryCalendarProvider>
      <DiaryCutCopyPasteProvider>
        <DiaryDialogProvider>
          <Component />
        </DiaryDialogProvider>
      </DiaryCutCopyPasteProvider>
    </DiaryCalendarProvider>
  );
}

export { DiaryCalendar };
