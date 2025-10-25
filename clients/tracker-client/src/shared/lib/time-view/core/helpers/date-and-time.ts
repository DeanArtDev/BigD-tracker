import dayjs, { type ConfigType, type Dayjs } from 'dayjs';

function createDate(date?: ConfigType): Dayjs {
  return dayjs.tz(date);
}

function toMidnight(date: ConfigType): Dayjs {
  return createDate(date).set('hours', 0).set('minutes', 0).set('seconds', 0).set('milliseconds', 0);
}

function toNextDay(date: ConfigType): Dayjs {
  return createDate(toMidnight(date)).add(1, 'day');
}

function toPrevDay(date: ConfigType): Dayjs {
  return createDate(toMidnight(date)).subtract(1, 'day');
}

export { toMidnight, toNextDay, toPrevDay, createDate };
