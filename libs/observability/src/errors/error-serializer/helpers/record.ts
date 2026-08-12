function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null;
}

function getString(value: Record<string, unknown>, key: string): string | undefined {
  const field = value[key];
  return typeof field === 'string' ? field : undefined;
}

function getBoolean(value: Record<string, unknown>, key: string): boolean | undefined {
  const field = value[key];
  return typeof field === 'boolean' ? field : undefined;
}

function getStringOrNumber(value: Record<string, unknown>, key: string): string | number | undefined {
  const field = value[key];
  return typeof field === 'string' || (typeof field === 'number' && Number.isFinite(field)) ? field : undefined;
}

function getConstructorName(value: object): string | undefined {
  const constructorName = value.constructor?.name;
  return constructorName != null && constructorName !== 'Object' ? constructorName : undefined;
}

function removeUndefinedFields<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)) as T;
}

export { getBoolean, getConstructorName, getString, getStringOrNumber, isRecord, removeUndefinedFields };
