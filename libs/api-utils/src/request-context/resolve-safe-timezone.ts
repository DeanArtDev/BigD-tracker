const resolveSafeTimezone = (tz?: string): string => {
  if (!tz) return 'UTC';
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return 'UTC';
  }
};

export { resolveSafeTimezone };
