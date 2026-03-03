const futureDate = (offsetDays: number): string =>
  new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000).toISOString();

const pastDate = (offsetDays: number): string => new Date(Date.now() - offsetDays * 24 * 60 * 60 * 1000).toISOString();

const startOfToday = (): string => new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

const oneMsBeforeStartOfToday = (): string => new Date(new Date().setHours(0, 0, 0, 0) - 1).toISOString();

const oneSecondBeforeStartOfToday = (): string => new Date(new Date().setHours(0, 0, 0, 0) - 1000).toISOString();

export { futureDate, pastDate, startOfToday, oneMsBeforeStartOfToday, oneSecondBeforeStartOfToday };
