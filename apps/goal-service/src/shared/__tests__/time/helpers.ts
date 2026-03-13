import { DateVo } from '@big-d/api-utils';

const futureDate = (offsetDays: number): string =>
  DateVo.format(new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000));

const pastDate = (offsetDays: number): string => DateVo.format(new Date(Date.now() - offsetDays * 24 * 60 * 60 * 1000));

const startOfToday = (): string => DateVo.format(new Date(new Date().setHours(0, 0, 0, 0)));

const oneMsBeforeStartOfToday = (): string => DateVo.format(new Date(new Date().setHours(0, 0, 0, 0) - 1));

const oneSecondBeforeStartOfToday = (): string => DateVo.format(new Date(new Date().setHours(0, 0, 0, 0) - 1000));

export { futureDate, pastDate, startOfToday, oneMsBeforeStartOfToday, oneSecondBeforeStartOfToday };
