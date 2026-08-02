import { CalendarType } from '@dayflow/core';

const EMPTY_GROUP_ID = 'EMPTY_GROUP_ID';

const emptyGroup: CalendarType = {
  id: EMPTY_GROUP_ID,
  name: 'Empty',
  colors: {
    lineColor: 'transparent',
    eventColor: 'color-mix(in oklab, var(--df-color-primary) 20%, transparent)',
    eventSelectedColor: 'color-mix(in oklab, var(--df-color-primary) 40%, transparent)',
    textColor: 'var(--foreground)',
  },
};

export { EMPTY_GROUP_ID, emptyGroup };
