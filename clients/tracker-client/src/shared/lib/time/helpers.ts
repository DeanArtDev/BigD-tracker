import type { ConfigType, Dayjs } from './';
import dayjs from './';

function getClosestTimeToNow(dates: (string | undefined | Dayjs)[]): ConfigType {
  if (dates.length === 0) return;

  const now = dayjs().millisecond(1);
  const onlySameOrBeforeNowDates: Dayjs[] = dates
    .filter(Boolean)
    .map((date) => dayjs(date))
    .filter((date) => date.isSameOrAfter(now));
  if (onlySameOrBeforeNowDates.length === 0) return;

  return dayjs.min(onlySameOrBeforeNowDates);
}

function isWithinCalendarDaysFromToday(date: dayjs.ConfigType, days: number): boolean {
  const d = dayjs(date);
  if (!d.isValid()) return false;

  const today = dayjs().startOf('day');
  const limit = today.add(days, 'day').endOf('day');

  return d.isSame(limit) || d.isBefore(limit);
}

function isSameDay(a: dayjs.ConfigType, b: dayjs.ConfigType): boolean {
  const da = dayjs(a);
  const db = dayjs(b);

  if (!da.isValid() || !db.isValid()) return false;

  return da.isSame(db, 'day');
}

export { getClosestTimeToNow, isWithinCalendarDaysFromToday, isSameDay };
