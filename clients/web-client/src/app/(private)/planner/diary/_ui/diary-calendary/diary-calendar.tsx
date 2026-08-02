'use client';

import type { EventDetailDialogProps, GridContextMenuSlotArgs } from '@dayflow/core';
import { DayFlowCalendar } from '@dayflow/react';
import { useCallback, useRef } from 'react';
import { DiaryCalendarProvider, DiaryDialogProvider, DiaryEventDetailDialog, useDiaryContext } from './context';
import { DiaryEventContextMenu, DiaryGridContextMenu, YearViewModeTabs } from './ui';

import './style.scss';

function Component() {
  const { calendar } = useDiaryContext();
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const renderGridContextMenu = useCallback(
    (props: GridContextMenuSlotArgs) => <DiaryGridContextMenu {...props} />,
    [],
  );
  const renderYearViewModeTabs = useCallback(() => <YearViewModeTabs />, []);
  const renderEventEditDialog = useCallback(
    (props: EventDetailDialogProps) => <DiaryEventDetailDialog {...props} />,
    [],
  );

  return (
    <div ref={calendarContainerRef} className="diary-calendar flex min-h-0 min-w-0 w-full grow p-2">
      <DayFlowCalendar
        calendar={calendar}
        eventDetailDialog={renderEventEditDialog}
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
      <DiaryDialogProvider>
        <Component />
      </DiaryDialogProvider>
    </DiaryCalendarProvider>
  );
}

export { DiaryCalendar };
