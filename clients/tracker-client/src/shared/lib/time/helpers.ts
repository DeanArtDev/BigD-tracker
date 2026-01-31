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

export { getClosestTimeToNow };
