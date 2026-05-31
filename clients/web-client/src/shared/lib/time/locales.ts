import { Locale } from 'dayjs/locale/*';
import timeAndDate from './index';

const browserLocale = navigator.language || navigator.languages?.[0] || 'ru-RU';
const localeCode = browserLocale.split('-')[0];

const localeImports: Record<string, () => Promise<Locale>> = {
  en: () => import('dayjs/locale/en'),
  ru: () => import('dayjs/locale/ru'),
};

try {
  await localeImports[localeCode]?.();
  timeAndDate.locale(localeCode);
} catch (e) {
  console.error('Locale download error:', e);
  timeAndDate.locale('ru');
}
