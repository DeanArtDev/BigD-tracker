import dayjs from 'dayjs';
import type { ConfigType } from './';

function getClosestTimeToNow(dates: ConfigType[]): ConfigType | undefined {
  if (dates.length === 0) return;

  const now = dayjs().millisecond(1);
  const onlyBeforeNowDates = dates
    .map((date) => dayjs(date))
    .filter((date) => date.millisecond() >= now.millisecond());
  if (onlyBeforeNowDates.length === 0) return;

  return dayjs.min(onlyBeforeNowDates);
}

export { getClosestTimeToNow };
