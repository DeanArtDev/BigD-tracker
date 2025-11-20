import { type ConfigType } from '@/shared/lib/time';
import { merge } from 'lodash-es';
import { DateAndTime } from '../helpers/date-and-time';
import type { TimeViewPosition } from './types';

interface TimeEventData {
  readonly name: string;
  readonly to: number | Date;
  readonly from: number | Date;
  readonly position: TimeViewPosition;
  readonly style?: { readonly zIndex: number };
}

class TimeEvent<TExtra = any> {
  #data: TimeEventData;
  #extra?: TExtra;

  constructor(data: TimeEventData, extra?: TExtra) {
    this.#data = data;
    this.#extra = extra;
  }

  public setPosition(position: Partial<TimeViewPosition>) {
    this.#data = merge(this.#data, { position });
  }

  public setStyle(style: Partial<TimeEventData['style']>) {
    this.#data = merge(this.#data, { style });
  }

  get name() {
    return this.#data.name;
  }
  get to() {
    return this.#data.to;
  }
  get from() {
    return this.#data.from;
  }
  get position() {
    return this.#data.position;
  }
  get style() {
    return this.#data.style;
  }
  get extra() {
    return this.#extra;
  }

  public isAllDay(currentDate: ConfigType): boolean {
    return DateAndTime.isDateInRange(currentDate, { from: this.#data.from, to: this.#data.to });
  }
}

export { TimeEvent, type TimeEventData };
