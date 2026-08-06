'use client';

import type { GridContextMenuSlotArgs } from '@dayflow/core';
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
import { DiaryEventContextMenu, DiaryGridContextMenu, YearViewModeTabs } from './ui';

import './style.scss';

function Component() {
  const { calendar } = useDiaryContext();
  const calendarContainerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={calendarContainerRef} className="diary-calendar flex min-h-0 min-w-0 w-full grow p-2">
      <DayFlowCalendar
        calendar={calendar}
        gridContextMenu={renderGridContextMenu}
        yearViewModeTabs={renderYearViewModeTabs}
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
