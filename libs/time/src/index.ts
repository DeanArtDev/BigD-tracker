import dayjs, { type ConfigType, type Dayjs } from 'dayjs';
import './plugins.js';

type TimeAndDateValue = ConfigType;
type TimeAndDate = Dayjs;

const timeAndDate = dayjs;

export { timeAndDate };
export { loadTimeLocale } from './locales.js';
export type { TimeAndDate, TimeAndDateValue };
