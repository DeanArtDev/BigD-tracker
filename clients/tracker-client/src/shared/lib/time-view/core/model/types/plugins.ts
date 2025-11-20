import type { Dayjs } from '@/shared/lib/time';
import type { TimeViewEvent } from '@/shared/lib/time-view/core';
import type { TimeViewPosition } from '.';
import { TimeEvent } from '../time-event';

interface TimeViewPlugin<TExtra = any> {
  readonly calculateEventsPositions: (
    events: TimeViewEvent<TExtra>[],
    selectedDate: Dayjs,
  ) => TimeEvent[];
  readonly shapeTimeLines: () => Dayjs[];
  readonly calculateTimeIndicator: () => TimeViewPosition;
}

export type { TimeViewPlugin };
