const ABSOLUTE_DATE_TIME_WITHOUT_TIMEZONE_LENGTH = 16;

function hasValidDateTimeStructure(value: string): boolean {
  return (
    value.length === ABSOLUTE_DATE_TIME_WITHOUT_TIMEZONE_LENGTH &&
    value[4] === '-' &&
    value[7] === '-' &&
    value[10] === 'T' &&
    value[13] === ':'
  );
}

export { hasValidDateTimeStructure };
