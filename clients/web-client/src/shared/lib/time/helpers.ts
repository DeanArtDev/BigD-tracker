import timeAndDate, { TimeAndDateValue } from './index';

class TimeHelper {
  static isLessThan24HoursLeft(value: TimeAndDateValue): boolean {
    const targetDate = timeAndDate(value);

    if (!targetDate.isValid()) {
      return false;
    }

    const diff = targetDate.diff(timeAndDate(), 'minutes', true);

    return diff > 0 && diff < 1440;
  }
}

export { TimeHelper };
