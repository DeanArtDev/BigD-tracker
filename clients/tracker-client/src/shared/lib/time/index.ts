import dayjs, { type Dayjs, type ConfigType } from 'dayjs';
import toObject from 'dayjs/plugin/toObject';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isToday from 'dayjs/plugin/isToday';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(toObject);
dayjs.extend(isBetween);
dayjs.extend(isToday);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(minMax);

const browserLocale = navigator.language || navigator.languages?.[0] || 'ru-RU';
const localeCode = browserLocale.split('-')[0];

const localeImports: Record<string, () => Promise<any>> = {
  en: () => import('dayjs/locale/en'),
  ru: () => import('dayjs/locale/ru'),
};

try {
  await localeImports[localeCode]?.();
  dayjs.locale(localeCode);
} catch (e) {
  console.error(e);
  dayjs.locale('ru');
}

(window as any).dayjs = dayjs;

export default dayjs;
export type { Dayjs, ConfigType };
export * from './helpers';
