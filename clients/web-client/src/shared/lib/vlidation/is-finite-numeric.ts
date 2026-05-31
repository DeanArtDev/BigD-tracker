function isFiniteNumeric(value: unknown): value is number {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (typeof value === 'string') {
    if (value.trim() === '') return false;
    return Number.isFinite(Number(value));
  }

  return false;
}

export { isFiniteNumeric };
