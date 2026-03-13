import { isString } from 'lodash';
import { TimeAndDate, timeAndDate } from '../time-and-date';
import { isValidAbsoluteDateTimeWithoutTimezone } from '../validation';
import { BaseValueObject } from './base-value-object';
import { ExceptionInvalidInvariant } from './exceptions';
import { TimezoneVo } from './timezone-vo';

type DateVoInput = string | number;

/**
 *  Value object для дат без таймзоны и миллисекунд
 * */
class DateVo implements BaseValueObject {
  static FORMAT = 'YYYY-MM-DDTHH:mm';

  /**
   * Возвращает Instant в формате UTC без таймзоны и миллисекунд, например: 2026-03-13T15:10
   * */
  static now(): DateVo {
    return DateVo.restore(timeAndDate.utc().format(DateVo.FORMAT));
  }

  /**
   * Переводит now дату с таймзоной, к floating time
   * 2026-03-13T15:10:37+07:00 -> 2026-03-13T15:10
   * */
  static nowByTZ(timezone: string): DateVo {
    const tz = TimezoneVo.create(timezone).value;
    return DateVo.restore(timeAndDate().tz(tz).utc(true).format(DateVo.FORMAT));
  }

  /**
   * Форматирует Instant (в UTC) под валидный формат YYYY-MM-DDTHH:mm
   * */
  static format(date: Date | string): string {
    return DateVo.create(timeAndDate(date).utc().format(DateVo.FORMAT)).value;
  }

  #state: TimeAndDate;

  private constructor(state: TimeAndDate) {
    this.#state = state;
  }

  get value(): string {
    return this.#state.format(DateVo.FORMAT);
  }

  get timestamp(): number {
    return this.#state.valueOf();
  }

  public static create(date: DateVoInput): DateVo {
    const newDate = timeAndDate(date);
    if (!newDate.isValid()) {
      throw new ExceptionInvalidInvariant({
        message: `Date: ${date.toString()} is invalid`,
        field: 'date',
      });
    }

    if (!isValidAbsoluteDateTimeWithoutTimezone(date) && isString(date)) {
      throw new ExceptionInvalidInvariant({
        message: `DateVo must be in format YYYY-MM-DDTHH:mm, but got: ${date}`,
        field: 'date',
      });
    }

    return new DateVo(newDate);
  }

  public static restore(date: DateVoInput): DateVo {
    const d = timeAndDate(date);

    if (d.utcOffset() > 0) {
      throw new ExceptionInvalidInvariant({
        message: `Restored date must not have a timezone offset: ${date}`,
        field: 'date',
      });
    }
    return new DateVo(d);
  }

  /**
   * Возвращает ZonedDateTime 2024-05-01T17:11:00+07:00
   * */
  public tz(timezone: string): string {
    return this.#state.tz(timezone).format();
  }

  public equals(other: DateVoInput | DateVo): boolean {
    const otherValue = other instanceof DateVo ? other.value : other;
    return this.#state.valueOf() === timeAndDate(otherValue).valueOf();
  }

  public isBefore(value: DateVoInput | DateVo): boolean {
    const otherValue = value instanceof DateVo ? value.value : value;
    return this.timestamp < DateVo.create(otherValue).timestamp;
  }

  public isAfter(value: DateVoInput | DateVo): boolean {
    const otherValue = value instanceof DateVo ? value.value : value;
    return this.timestamp > DateVo.create(otherValue).timestamp;
  }
}

export { DateVo };
