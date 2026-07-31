import { Locale } from 'dayjs/locale/*';
import timeAndDate from './index';

const browserLocale = navigator.languages?.[0] ?? navigator.language ?? 'ru-RU';

const localeImports: Record<string, () => Promise<Locale>> = {
  en: () => import('dayjs/locale/en'),
  ru: () => import('dayjs/locale/ru'),
};

const localeCode = browserLocale.split('-')[0];

const selectedLocale = localeCode in localeImports ? localeCode : 'ru';

try {
  await localeImports[selectedLocale]?.();
  timeAndDate.locale(selectedLocale);
} catch (e) {
  console.error('Locale download error:', e);
  timeAndDate.locale('ru');
}
