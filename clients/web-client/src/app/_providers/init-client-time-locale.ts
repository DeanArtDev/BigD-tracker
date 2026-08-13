import { loadTimeLocale } from '@big-d/time';

const browserLocale = navigator.languages?.[0] ?? navigator.language ?? 'ru-RU';

const localeCode = browserLocale.split('-')[0];

try {
  await loadTimeLocale(localeCode);
} catch (error) {
  try {
    await loadTimeLocale('eu');
  } catch {
    throw error;
  }
}
