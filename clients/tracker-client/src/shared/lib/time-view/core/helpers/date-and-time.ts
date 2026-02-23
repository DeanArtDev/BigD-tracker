import dayjs, { type ConfigType, type Dayjs } from '@/shared/lib/time';
import type { DeepPartial } from '@/shared/lib/type-helpers';
import { merge } from 'lodash-es';

interface DateAndTimeOptions {
  readonly locale: string;
}

const defaultOptions: DateAndTimeOptions = {
  locale: 'ru',
};

class DateAndTime {
  constructor(options?: DeepPartial<DateAndTimeOptions>) {
    if (options != null) {
      merge(this.#options, options);
    }
  }

  #options: DateAndTimeOptions = defaultOptions;

  public createDate = (date?: ConfigType): Dayjs => {
    return DateAndTime.createDate(date, this.#options.locale);
  };

  public toNextDay = (date: ConfigType): Dayjs => {
    return this.createDate(date).startOf('day').add(1, 'day');
  };

  public toPrevDay = (date: ConfigType): Dayjs => {
    return this.createDate(date).startOf('day').subtract(1, 'day');
  };

  public getFromAndTo = (date: ConfigType): { from: Dayjs; to: Dayjs } => {
    return DateAndTime.getFromAndTo(date, this.#options.locale);
  };

  static createDate(date?: ConfigType, locale?: string) {
    const d = dayjs.tz(date);
    if (locale != null) {
      return d.locale(locale);
    }
    return d;
  }

  static isDateInRange(
    currentDate: ConfigType,
    range: { from: number | Date; to: number | Date },
  ): boolean {
    const { from: startCurrentDate, to: endCurrentDate } = DateAndTime.getFromAndTo(currentDate);

    const from = DateAndTime.createDate(range.from);
    const to = DateAndTime.createDate(range.to);

    return from.isSameOrBefore(startCurrentDate) && to.isSameOrAfter(endCurrentDate);
  }

  static getFromAndTo = (date: ConfigType, locale?: string): { from: Dayjs; to: Dayjs } => {
    const newDate = DateAndTime.createDate(date, locale);

    return {
      from: newDate.startOf('day').set('milliseconds', 0),
      to: newDate.endOf('day').set('milliseconds', 0),
    };
  };
}

export { DateAndTime, type DateAndTimeOptions };
