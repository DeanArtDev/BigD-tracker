import { timeAndDate } from '@big-d/time';
import { ICalendarApp, LocaleProvider, MiniCalendar } from '@dayflow/core';
import { h, render } from 'preact';
import { useEffect, useLayoutEffect, useRef } from 'react';

interface DiaryMiniCalendarProps {
  readonly app: ICalendarApp;
  readonly showEventDots?: boolean;
}

function DiaryMiniCalendar({ app, showEventDots }: DiaryMiniCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const viewConfig = app.getViewConfig(app.state.currentView);
    const timeZone = typeof viewConfig.secondaryTimeZone === 'string' ? viewConfig.secondaryTimeZone : undefined;

    render(
      h(
        LocaleProvider,
        { locale: app.state.locale },
        h(MiniCalendar, {
          calendarRegistry: app.getCalendarRegistry(),
          currentDate: app.getCurrentDate(),
          events: app.getEvents(),
          onDateSelect: (date) => app.setCurrentDate(date),
          onMonthChange: (offset) => {
            const current = app.getVisibleMonth();
            app.setVisibleMonth(timeAndDate(current).add(offset, 'month').toDate());
          },
          showEventDots,
          showHeader: true,
          timeZone,
          visibleMonth: app.getVisibleMonth(),
        }),
      ),
      container,
    );
  });

  useEffect(() => {
    const container = containerRef.current;

    return () => {
      if (container) render(null, container);
    };
  }, []);

  return <div ref={containerRef} />;
}

export { DiaryMiniCalendar };
