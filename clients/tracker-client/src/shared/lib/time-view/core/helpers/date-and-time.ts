import type { DeepPartial } from '@/shared/lib/type-helpers';
import dayjs, { type ConfigType, type Dayjs } from '@/shared/lib/time';
import { merge } from 'lodash-es';

interface DateAndTimeOptions {
  readonly locale: string;
}

const defaultOptions: DateAndTimeOptions = {
  locale: 'ru'
};

class DateAndTime {
  constructor(options?: DeepPartial<DateAndTimeOptions>) {
    if (options != null) {
      merge(this.#options, options);
    }
  }

  #options: DateAndTimeOptions = defaultOptions;

  toMidnight(date: ConfigType): Dayjs {
    return this.createDate(date)
      .set('hours', 0)
      .set('minutes', 0)
      .set('seconds', 0)
      .set('milliseconds', 0);
  }

  public createDate = (date?: ConfigType): Dayjs => {
    return dayjs.tz(date);
  };
  public toNextDay = (date: ConfigType): Dayjs => {
    return this.createDate(this.toMidnight(date)).add(1, 'day');
  };
  public toPrevDay = (date: ConfigType): Dayjs => {
    return this.createDate(this.toMidnight(date)).subtract(1, 'day');
  };
  public getCurrenLocale = (): string => {
    return dayjs.locale();
  };
}

export { DateAndTime, type DateAndTimeOptions };
