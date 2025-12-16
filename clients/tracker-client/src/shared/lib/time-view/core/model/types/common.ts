import type { Dayjs } from '@/shared/lib/time';

interface TimeViewEventMap {
  readonly initiated: undefined;
  readonly updated: undefined;
}

interface TimeViewEvent<TExtra = any> {
  readonly name: string;
  readonly to: number | Date;
  readonly from: number | Date;
  readonly extra?: TExtra;
}

interface TimeViewControllerOptions {
  readonly locale?: string;
}

interface TimeViewControllerState {
  readonly dayTimeLine: Dayjs[];
  readonly selectedDate: Dayjs;
  readonly currentTime: () => Dayjs;
}

interface TimeViewDateSet {
  readonly from: Dayjs;
  readonly to: Dayjs;
}

interface TimeViewControllerApi {
  readonly next: () => Dayjs;
  readonly prev: () => Dayjs;
  readonly today: () => Dayjs;
}

// all values are percents
interface TimeViewPosition {
  readonly top: string;
  readonly left: string;
  readonly bottom: string;
  readonly right: string;
}

export type {
  TimeViewEventMap,
  TimeViewEvent,
  TimeViewControllerOptions,
  TimeViewControllerState,
  TimeViewControllerApi,
  TimeViewDateSet,
  TimeViewPosition,
};
