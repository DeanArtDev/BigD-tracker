import type { ConfigType, Dayjs } from './';
import dayjs from './';

function getClosestTimeToNow(dates: (string | undefined | Dayjs)[]): ConfigType | undefined {
  if (dates.length === 0) return;

  const now = dayjs().millisecond(1);
  const onlyBeforeNowDates = dates
    .filter((date) => dayjs(date).isSameOrAfter(now))
    .map((date) => dayjs(date))
    .filter((date) => date.millisecond() >= now.millisecond());
  if (onlyBeforeNowDates.length === 0) return;

  return dayjs.min(onlyBeforeNowDates);
}

export { getClosestTimeToNow };
