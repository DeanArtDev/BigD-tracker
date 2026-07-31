import {
  CalendarView,
  ContentSlot,
  createAgendaView,
  createDayView,
  createMonthView,
  createWeekView,
  createYearView,
  YearViewConfig,
} from '@dayflow/core';
import { h } from 'preact';
import { useMemo } from 'react';

type YearViewMode = NonNullable<YearViewConfig['mode']>;

const YEAR_VIEW_MODES = ['year-canvas', 'fixed-week', 'grid'] as const satisfies readonly YearViewMode[];

function useViews({ yearViewMode }: { yearViewMode: YearViewMode }) {
  return useMemo<CalendarView[]>(() => {
    return [
      createDayView({
        showEventDots: true,
        scrollToCurrentTime: true,
      }),
      createWeekView({
        gridDateClick: 'day-view',
        showEventDots: true,
        scrollToCurrentTime: true,
        showWeekends: true,
      }),
      createMonthView({
        showEventDots: true,
        showWeekNumbers: true,
        showMonthIndicator: true,
        gridDateDoubleClick: 'day-view',
      }),
      getYearViewConfig({ yearViewMode }),
      createAgendaView({ showEmptyDays: true, daysToShow: 30 }),
    ];
  }, [yearViewMode]);
}

function getYearViewConfig({ yearViewMode }: { yearViewMode?: YearViewMode }): CalendarView {
  const yearView = createYearView({
    mode: yearViewMode,
    gridDateDoubleClick: 'day-view',
    showTimedEventsInYearView: true,
    startOfWeek: 7,
    showEventDots: true,
  });
  const YearViewComponent = yearView.component;

  return {
    ...yearView,
    component: (props) => {
      return h('div', { className: 'diary-year-view' }, [
        h(YearViewComponent, props),
        h(
          'div',
          { className: 'diary-year-view-mode-tabs' },
          h(ContentSlot, {
            generatorName: 'yearViewModeTabs',
            generatorArgs: {},
          }),
        ),
      ]);
    },
  };
}

export { YEAR_VIEW_MODES, useViews, type YearViewMode };
