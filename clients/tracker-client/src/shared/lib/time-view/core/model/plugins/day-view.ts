import { type Dayjs } from '@/shared/lib/time';
import { DateAndTime } from '../../helpers/date-and-time';
import { getPercentByValue, getPercentFromPercent } from '../../helpers/math';
import { TimeEvent } from '../time-event';
import type { TimeViewEvent, TimeViewPlugin, TimeViewPosition } from '../types';

class DayViewPlugin<TExtra = any> implements TimeViewPlugin<TExtra> {
  constructor(deps: { timeController: DateAndTime }) {
    this.#time = deps.timeController;
  }

  #time!: DateAndTime;

  #isInRangeSelectedDates(dateSet: { from: Dayjs; to: Dayjs }, currentDate: Dayjs): boolean {
    const { from: startCurrentDate, to: endCurrentDate } = this.#time.getFromAndTo(currentDate);

    const from = this.#time.createDate(dateSet.from);
    const to = this.#time.createDate(dateSet.from);

    return from.isSameOrBefore(startCurrentDate) && to.isSameOrAfter(endCurrentDate);
  }

  public calculateEventsPositions(
    events: TimeViewEvent<TExtra>[],
    selectedDate: Dayjs,
  ): TimeEvent[] {
    const buffer: TimeEvent[] = [];

    for (const { extra, ...event } of events) {
      const { from, to } = {
        from: this.#time.createDate(event.from),
        to: this.#time.createDate(event.to),
      };

      if (this.#isInRangeSelectedDates({ from, to }, selectedDate)) {
        continue;
      }

      const position = this.#calculateEventPosition({ from, to }, selectedDate);

      buffer.push(
        new TimeEvent(
          {
            name: event.name,
            from: this.#time.createDate(event.from).toDate(),
            to: this.#time.createDate(event.to).toDate(),
            position,
          },
          extra,
        ),
      );
    }

    const hashFn = (event: TimeEvent<TExtra>) => event.from.toString() + event.to.toString();
    const intersectionsBetweenOrEqualMap = this.#findIntersectionsBetweenOrEqual(
      buffer.filter((i) => !i.isAllDay(selectedDate.toDate())),
      hashFn,
    );

    for (const bufferElement of buffer) {
      const hashKey = hashFn(bufferElement);
      const set = intersectionsBetweenOrEqualMap.get(hashKey);
      if (set == null || set.size === 0) return buffer;

      const container = 100;
      const part = container / (set.size + 1);
      const right = container - part;
      const overCoverPercent = 20;

      bufferElement.setPosition({ right: `${right}%`, left: '0%' });

      Array.from(set).forEach((event, index) => {
        const shift = index + 1;
        const shiftedRight = right - part * shift;
        const left = part * shift;

        event.setPosition({
          right: `${shiftedRight}%`,
          left: `${left - getPercentFromPercent(overCoverPercent, left)}%`,
        });
        event.setStyle({ zIndex: shift });
      });
    }

    return buffer;
  }

  public calculateTimeIndicator(): TimeViewPosition {
    const timestamp = this.#time.createDate();
    const { top, bottom } = this.#calculateEventPosition({ from: timestamp, to: timestamp });

    return {
      top,
      left: '0',
      right: '0',
      bottom,
    };
  }

  public shapeTimeLines(): Dayjs[] {
    return new Array(24).fill(0).map((_, index) => {
      return this.#time.createDate().startOf('date').add(index, 'hour');
    });
  }

  #findIntersectionsBetweenOrEqual(
    events: TimeEvent<TExtra>[],
    hashFn: (parentEvent: TimeEvent<TExtra>) => string,
  ): Map<string, Set<TimeEvent<TExtra>>> {
    const map = new Map<string, Set<TimeEvent<TExtra>>>();

    let i = 0;
    while (i < events.length) {
      const parentEvent = events[i];
      const hashKey = hashFn(parentEvent);

      let j = i + 1;
      while (j < events.length) {
        const nextEvent = events[j];

        const isBetween = this.#time
          .createDate(nextEvent.from)
          .isBetween(parentEvent.from, parentEvent.to, 'minutes', '[]');

        if (isBetween) {
          const set =
            map.get(hashKey) ?? map.set(hashKey, new Set<TimeEvent<TExtra>>()).get(hashKey);
          set?.add(nextEvent);
        } else {
          break;
        }
        ++j;
      }

      i = j;
    }

    return map;
  }

  #calculateEventPosition(
    event: { readonly to: Dayjs; readonly from: Dayjs },
    selectedDate?: Dayjs,
  ): TimeViewPosition {
    const {
      date: fromDays,
      hours: fromHours,
      minutes: fromMinutes,
    } = this.#time.createDate(event.from).toObject();

    const {
      date: toDays,
      hours: toHours,
      minutes: toMinutes,
    } = this.#time.createDate(event.to).toObject();

    const lineCount = this.shapeTimeLines().length;
    const yHourPart = 100 / lineCount;

    const fromMinutesShift = yHourPart * (getPercentByValue(fromMinutes, 60) / 100);
    const top = yHourPart * fromHours + fromMinutesShift;

    const toMinutesShift = yHourPart * (getPercentByValue(toMinutes, 60) / 100);
    const bottom = 100 - (yHourPart * toHours + toMinutesShift);

    const isEventStart = fromDays === selectedDate?.date();
    const isEventFinish = toDays === selectedDate?.date();
    const isEventManyDays = fromDays !== toDays;

    if (isEventManyDays) {
      if (isEventStart) {
        return {
          top: `${top}%`,
          left: '0',
          right: '0',
          bottom: '0',
        };
      }

      if (isEventFinish) {
        return {
          top: '0',
          left: '0',
          right: '0',
          bottom: `${bottom}%`,
        };
      }
    }

    return {
      top: `${top}%`,
      left: '0',
      right: '0',
      bottom: `${bottom}%`,
    };
  }
}

export { DayViewPlugin };
