'use client';

import { DayFlowCalendar } from '@dayflow/react';
import { useRef } from 'react';
import { DiaryCalendarProvider, useDiaryContext } from './context';
import { DiaryEventContextMenu, DiaryGridContextMenu, YearViewModeTabs } from './ui';

import './style.scss';

function Component() {
  const { calendar } = useDiaryContext();
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={calendarContainerRef} className="diary-calendar flex min-h-0 min-w-0 w-full grow p-2">
      <DayFlowCalendar
        calendar={calendar}
        gridContextMenu={(props) => <DiaryGridContextMenu {...props} />}
        yearViewModeTabs={() => <YearViewModeTabs />}
      />
      <DiaryEventContextMenu containerRef={calendarContainerRef} />
    </div>
  );
}

function DiaryCalendar() {
  return (
    <DiaryCalendarProvider>
      <Component />
    </DiaryCalendarProvider>
  );
}

export { DiaryCalendar };
