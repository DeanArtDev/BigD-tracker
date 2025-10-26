import { DateAndTime } from '../helpers/date-and-time';
import { LineEventView } from './line-event-view';
import type { DeepPartial } from '@/shared/lib/type-helpers';
import { type Dayjs } from '@/shared/lib/time';
import { merge } from 'lodash-es';
import { getPercentFromPercent, getPercentByValue } from '../helpers/math';
import type { TimeLineEvent, TimeViewControllerEventMap, TimeViewControllerOptions } from './types';
import { EventEmitter } from '../utils/event-emitter';

interface TimeViewControllerState<TExtra = any> {
  readonly events: TimeLineEvent<TExtra>[];
  readonly dayTimeLine: Dayjs[];
  readonly selectedDate: Dayjs;
  readonly currentTime: () => Dayjs;
}

interface TimeViewControllerApi {
  readonly next: () => Dayjs;
  readonly prev: () => Dayjs;
  readonly today: () => Dayjs;
}

class TimeViewController<TExtra = any> {
  constructor(options?: DeepPartial<TimeViewControllerOptions>) {
    if (options != null) {
      this.#options = merge(this.#defaultOptions, options);
    }
    this.#time = new DateAndTime({ locale: this.#options.locale });
    this.#state = this.#defaultState
  }

  #state!: TimeViewControllerState<TExtra>;
  #options!: TimeViewControllerOptions;
  #time!: DateAndTime;
  #eventEmitter = new EventEmitter<TimeViewControllerEventMap>({ listenersLimit: 20 });

  #defaultOptions: TimeViewControllerOptions = {
    view: {
      lineCount: 25,
      timeColumnOffset: 50,
    },
  };

  get #defaultState(): TimeViewControllerState<TExtra> {
    return {
      events: [],
      dayTimeLine: this.#createDayTimeLine(),
      selectedDate: this.#time.createDate(),
      currentTime: this.#time.createDate,
    };
  }

  #createDayTimeLine(): Dayjs[] {
    let buffer: Dayjs[] = [];

    buffer = new Array(24).fill(0).map((_, index) => {
      return this.#time.createDate().startOf('date').add(index, 'hour');
    });

    buffer.push(this.#time.createDate().startOf('date').add(1, 'day'));

    return buffer;
  }

  get state() {
    return this.#state;
  }

  public init() {
    this.#eventEmitter.emit('initiated');
  }

  public on(event: keyof TimeViewControllerEventMap, callback: () => void): this {
    this.#eventEmitter.on(event, callback);
    return this;
  }

  public off(event: keyof TimeViewControllerEventMap, callback: () => void): this {
    this.#eventEmitter.off(event, callback);
    return this;
  }

  public get api(): TimeViewControllerApi {
    return {
      next: () => {
        this.#state = {
          ...this.#state,
          selectedDate: this.#time.toNextDay(this.#state.selectedDate),
        };
        this.#emitUpdate();
        return this.#state.selectedDate;
      },

      prev: () => {
        this.#state = {
          ...this.#state,
          selectedDate: this.#time.toPrevDay(this.#state.selectedDate),
        };
        this.#emitUpdate();
        return this.#state.selectedDate;
      },

      today: () => {
        this.#state = {
          ...this.#state,
          selectedDate: this.#time.toMidnight(this.#state.currentTime()),
        };
        this.#emitUpdate();
        return this.#state.selectedDate;
      },
    };
  }

  public destroy = (): void => {
    this.#state = this.#defaultState,
    this.#options = this.#defaultOptions;
    this.#eventEmitter.offAll();
  };

  public setEvents(events: TimeLineEvent<TExtra>[]): void {
    this.#state = { ...this.#state, events };
    this.#emitUpdate();
  }

  public calculateCurrentTimePosition(plane: { width: number; height: number }): {
    x: number;
    y: number;
  } {
    const timestamp = Date.now();
    const { y } = this.#calculateEventPositionAndStyle({ from: timestamp, to: timestamp }, plane);

    return { x: 0, y };
  }

  public getEventViews(plane: { width: number; height: number }): LineEventView<TExtra>[] {
    const buffer: LineEventView[] = [];
    for (const { extra, ...event } of this.#state.events) {
      const { x, y, height, width } = this.#calculateEventPositionAndStyle(event, plane);

      buffer.push(
        new LineEventView(
          {
            ...event,
            position: { x, y },
            style: { height, width },
          },
          extra,
        ),
      );
    }

    const map = this.#findIntersectionsBetweenOrEqual(buffer);

    for (const bufferElement of buffer) {
      const hashKey = bufferElement.from.toString() + bufferElement.to.toString();
      const set = map.get(hashKey);
      if (set != null) {
        if (set.size > 0) {
          const parts = set.size + 1;
          const width = 100 / parts;
          const overCover = 15;
          bufferElement.setStyle({ width: `${width + getPercentFromPercent(overCover, width)}%` });

          Array.from(set).forEach((event, index) => {
            const shift = index + 1;
            const x = width * shift;

            event.setStyle({
              width: `${width + getPercentFromPercent(overCover, width)}%`,
              zIndex: 1,
            });
            event.setPosition({ x: `${x - getPercentFromPercent(overCover, width)}%` });
          });
        }
      }
    }

    return buffer;
  }

  #findIntersectionsBetweenOrEqual(
    events: LineEventView<TExtra>[],
  ): Map<string, Set<LineEventView<TExtra>>> {
    const map = new Map<string, Set<LineEventView<TExtra>>>();

    let i = 0;

    while (i < events.length) {
      const event = events[i];
      const hashKey = event.from.toString() + event.to.toString();

      let j = i + 1;
      while (j < events.length) {
        const e = events[j];
        ++j;
        i = j;

        const isBetween = this.#time
          .createDate(e.from)
          .isBetween(event.from, event.to, 'minutes', '[]');

        if (isBetween) {
          const set =
            map.get(hashKey) ?? map.set(hashKey, new Set<LineEventView<TExtra>>()).get(hashKey);

          set?.add(e);
        } else {
          break;
        }
      }

      ++i;
    }

    return map;
  }

  #calculateEventPositionAndStyle(
    event: { readonly to: number | Date; readonly from: number | Date },
    plane: { width: number; height: number },
  ): {
    readonly x: number;
    readonly y: number;
    readonly width: number | string;
    readonly height: number | string;
  } {
    const { hours: fromHours, minutes: fromMinutes } = this.#time.createDate(event.from).toObject();
    const { hours: toHours, minutes: toMinutes } = this.#time.createDate(event.to).toObject();

    const yHourPart = plane.height / this.#options.view.lineCount;

    const fromMinutesShift = yHourPart * (getPercentByValue(fromMinutes, 60) / 100);
    const y = yHourPart * fromHours + fromMinutesShift;

    const toMinutesShift = yHourPart * (getPercentByValue(toMinutes, 60) / 100);
    const height = yHourPart * toHours + toMinutesShift - y;

    return { y, x: 0, height, width: `${100}%` };
  }

  #emitUpdate() {
    this.#eventEmitter.emit('updated');
  }
}

export { TimeViewController };
