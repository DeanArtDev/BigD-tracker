import { CalendarType } from '@dayflow/core';
import { ViewType } from '@dayflow/core';
import timeAndDate, { TimeAndDateValue } from '@/shared/lib/time';

const EMPTY_GROUP_ID = 'EMPTY_GROUP_ID';

const emptyGroup: CalendarType = {
  id: EMPTY_GROUP_ID,
  name: 'Без группы',
  colors: {
    lineColor: 'transparent',
    eventColor: 'color-mix(in oklab, var(--df-color-primary) 20%, transparent)',
    eventSelectedColor: 'color-mix(in oklab, var(--df-color-primary) 40%, transparent)',
    textColor: 'var(--foreground)',
  },
};

type DiaryViewType = Exclude<ViewType, ViewType.RESOURCE>;

type DiaryViewRange = {
  readonly from: string;
  readonly to: string;
};

type DiaryViewRangeResolver = (date: TimeAndDateValue) => DiaryViewRange;

const DATE_FORMAT = 'YYYY-MM-DD';

const diaryViewRangeMap = {
  [ViewType.DAY]: (date) => {
    const from = timeAndDate(date).startOf('day');

    return {
      from: from.format(DATE_FORMAT),
      to: from.add(1, 'day').format(DATE_FORMAT),
    };
  },
  [ViewType.WEEK]: (date) => {
    const currentDate = timeAndDate(date).startOf('day');
    const daysSinceMonday = (currentDate.day() + 6) % 7;
    const from = currentDate.subtract(daysSinceMonday, 'day');

    return {
      from: from.format(DATE_FORMAT),
      to: from.add(7, 'days').format(DATE_FORMAT),
    };
  },
  [ViewType.MONTH]: (date) => {
    const firstDayOfMonth = timeAndDate(date).startOf('month');
    const daysSinceMonday = (firstDayOfMonth.day() + 6) % 7;
    const from = firstDayOfMonth.subtract(daysSinceMonday, 'day');

    return {
      from: from.format(DATE_FORMAT),
      to: from.add(42, 'days').format(DATE_FORMAT),
    };
  },
  [ViewType.YEAR]: (date) => {
    const from = timeAndDate(date).startOf('year');

    return {
      from: from.format(DATE_FORMAT),
      to: from.add(1, 'year').format(DATE_FORMAT),
    };
  },
  [ViewType.AGENDA]: (date) => {
    const from = timeAndDate(date).startOf('day');

    return {
      from: from.format(DATE_FORMAT),
      to: from.add(30, 'days').format(DATE_FORMAT),
    };
  },
} satisfies Record<DiaryViewType, DiaryViewRangeResolver>;

export { diaryViewRangeMap, type DiaryViewRange, type DiaryViewType };
export { EMPTY_GROUP_ID, emptyGroup };
