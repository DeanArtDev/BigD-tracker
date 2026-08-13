import dayjs from 'dayjs';

type TimeLocale = 'en' | 'ru';

const localeImports: Record<TimeLocale, () => Promise<unknown>> = {
  en: () => import('dayjs/locale/en.js'),
  ru: () => import('dayjs/locale/ru.js'),
};

async function loadTimeLocale(locale: string): Promise<TimeLocale> {
  const selectedLocale: TimeLocale = locale === 'en' ? 'en' : 'ru';

  await localeImports[selectedLocale]();
  dayjs.locale(selectedLocale);

  return selectedLocale;
}

export { loadTimeLocale };
export type { TimeLocale };
