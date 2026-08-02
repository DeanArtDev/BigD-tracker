import timeAndDate from '@/shared/lib/time';
import type { DateAndTimePickerProps } from './date-and-time-picker.types';

function getMinutes(step: number, currentMinute: number) {
  const minutes = Array.from({ length: Math.ceil(60 / step) }, (_, index) => index * step).filter(
    (minute) => minute < 60,
  );

  return minutes.includes(currentMinute) ? minutes : [...minutes, currentMinute].toSorted((a, b) => a - b);
}

function getDefaultValue(value: Date | undefined | null, defaultTime: DateAndTimePickerProps['defaultTime']) {
  if (value != null) return value;

  const current = timeAndDate();

  return current
    .set('hour', defaultTime?.hour ?? current.hour())
    .set('minute', defaultTime?.minute ?? current.minute())
    .set('second', 0)
    .set('millisecond', 0)
    .toDate();
}

function replaceDate(value: Date, date: Date) {
  const time = timeAndDate(value);

  return timeAndDate(date)
    .set('hour', time.hour())
    .set('minute', time.minute())
    .set('second', time.second())
    .set('millisecond', time.millisecond())
    .toDate();
}

export { getDefaultValue, getMinutes, replaceDate };
