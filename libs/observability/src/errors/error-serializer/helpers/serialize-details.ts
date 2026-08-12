import { KNOWN_ERROR_FIELDS, NESTED_CAUSE_FIELDS, NESTED_CAUSE_FIELD_SET } from '../constants';
import { toSerializableRecord } from './serializable-value';

function getCause(error: Record<string, unknown>, details?: Record<string, unknown>): unknown {
  for (const field of NESTED_CAUSE_FIELDS) {
    if (error[field] !== undefined) return error[field];
  }

  if (details == null) return undefined;

  for (const field of NESTED_CAUSE_FIELDS) {
    if (details[field] !== undefined) return details[field];
  }

  return undefined;
}

function getSerializedDetails(
  error: Record<string, unknown>,
  details?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const additionalDetails = Object.fromEntries(Object.entries(error).filter(([key]) => !KNOWN_ERROR_FIELDS.has(key)));
  const explicitDetails =
    details == null
      ? {}
      : Object.fromEntries(Object.entries(details).filter(([key]) => !NESTED_CAUSE_FIELD_SET.has(key)));
  const mergedDetails = { ...additionalDetails, ...explicitDetails };

  if (Object.keys(mergedDetails).length === 0) return undefined;

  return toSerializableRecord(mergedDetails);
}

export { getCause, getSerializedDetails };
