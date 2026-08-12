import type { ErrorLog } from '../../../contracts';
import { CIRCULAR_REFERENCE_MESSAGE, CIRCULAR_REFERENCE_TYPE } from '../constants';
import type { SerializationContext } from '../types';
import { getBoolean, getConstructorName, getString, isRecord, removeUndefinedFields } from './record';
import { getCause, getSerializedDetails } from './serialize-details';
import { serializePrimitiveError } from './serialize-primitive';

function serializeErrorNode(error: unknown, depth: number, context: SerializationContext): ErrorLog {
  if (!isRecord(error)) return serializePrimitiveError(error);

  if (context.errorPath.has(error)) {
    return {
      type: CIRCULAR_REFERENCE_TYPE,
      message: CIRCULAR_REFERENCE_MESSAGE,
    };
  }

  context.errorPath.add(error);

  try {
    const details = isRecord(error.details) ? error.details : undefined;
    const cause = getCause(error, details);
    const errorLog: ErrorLog = {
      type: getErrorType(error),
      message: getErrorMessage(error),
      stack: getString(error, 'stack'),
      key: getString(error, 'key'),
      code: getString(error, 'code'),
      operation: getString(error, 'operation') ?? (details == null ? undefined : getString(details, 'operation')),
      retryable: getBoolean(error, 'retryable') ?? (details == null ? undefined : getBoolean(details, 'retryable')),
      constraint: getString(error, 'constraint'),
      severity: getString(error, 'severity'),
      schema: getString(error, 'schema'),
      table: getString(error, 'table'),
      column: getString(error, 'column'),
      dataType: getString(error, 'dataType'),
      detail: getString(error, 'detail'),
      hint: getString(error, 'hint'),
      position: getString(error, 'position'),
      internalPosition: getString(error, 'internalPosition'),
      where: getString(error, 'where'),
      file: getString(error, 'file'),
      line: getString(error, 'line'),
      routine: getString(error, 'routine'),
      details: getSerializedDetails(error, details),
      cause:
        cause !== undefined && depth + 1 < context.maxDepth ? serializeErrorNode(cause, depth + 1, context) : undefined,
    };

    return removeUndefinedFields(errorLog);
  } finally {
    context.errorPath.delete(error);
  }
}

function getErrorType(error: Record<string, unknown>): string {
  return getString(error, 'type') ?? getString(error, 'name') ?? getConstructorName(error) ?? 'Error';
}

function getErrorMessage(error: Record<string, unknown>): string {
  return getString(error, 'message') ?? 'Unknown error';
}

export { serializeErrorNode };
