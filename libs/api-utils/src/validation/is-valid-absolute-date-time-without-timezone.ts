import { hasValidDateTimeStructure } from './has-valid-date-time-structure';

function readDatePart(value: string, from: number, to: number): number | null {
  const part = Number(value.slice(from, to));

  return Number.isNaN(part) ? null : part;
}

function isValidAbsoluteDateTimeWithoutTimezone(value: unknown): boolean {
  if (typeof value !== 'string' || !hasValidDateTimeStructure(value)) {
    return false;
  }

  const year = readDatePart(value, 0, 4);
  const month = readDatePart(value, 5, 7);
  const day = readDatePart(value, 8, 10);
  const hour = readDatePart(value, 11, 13);
  const minute = readDatePart(value, 14, 16);
  const second = 0;

  if (
    year == null ||
    month == null ||
    day == null ||
    hour == null ||
    minute == null ||
    second == null ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute &&
    date.getUTCSeconds() === second
  );
}

export { isValidAbsoluteDateTimeWithoutTimezone };
