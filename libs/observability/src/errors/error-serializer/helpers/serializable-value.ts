import { OMITTED_ERROR_DETAIL_FIELDS } from '../constants';
import { isRecord, removeUndefinedFields } from './record';

function toSerializableRecord(value: Record<string, unknown>): Record<string, unknown> {
  return toSerializableValue(value, new WeakSet<object>()) as Record<string, unknown>;
}

function toSerializableValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'symbol') return value.description == null ? 'Symbol()' : `Symbol(${value.description})`;
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
  if (value instanceof Date) return value.toISOString();

  if (!isRecord(value)) return Object.prototype.toString.call(value);
  if (seen.has(value)) return '[Circular]';

  seen.add(value);

  try {
    if (value instanceof Error) {
      return removeUndefinedFields({
        type: value.name || value.constructor.name,
        message: value.message,
        stack: value.stack,
        ...toSerializableEntries(value, seen),
      });
    }

    if (Array.isArray(value)) return value.map((item) => toSerializableValue(item, seen));

    return toSerializableEntries(value, seen);
  } finally {
    seen.delete(value);
  }
}

function toSerializableEntries(value: Record<string, unknown>, seen: WeakSet<object>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !OMITTED_ERROR_DETAIL_FIELDS.has(key))
      .map(([key, fieldValue]) => [key, toSerializableValue(fieldValue, seen)]),
  );
}

export { toSerializableRecord };
