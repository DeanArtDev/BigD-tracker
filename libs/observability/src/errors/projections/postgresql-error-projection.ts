import type { ErrorProjection } from '../error-projection';
import {
  getConstructorName,
  getString,
  getStringOrNumber,
  isRecord,
  removeUndefinedFields,
} from '../error-serializer/helpers/record';
import { getCause } from '../error-serializer/helpers/serialize-details';
import { getPrimitiveMessage } from '../error-serializer/helpers/serialize-primitive';

const RETRYABLE_POSTGRESQL_CODES = new Set(['40001', '40P01', '55P03', '57P01', '57P02', '57P03']);
const RETRYABLE_NETWORK_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'EPIPE',
  'ETIMEDOUT',
]);

function projectPostgresqlError(error: unknown): ErrorProjection {
  if (!isRecord(error)) {
    return {
      type: 'PostgresqlError',
      message: getPrimitiveMessage(error),
    };
  }

  const code = getString(error, 'code');
  const details = getNetworkDetails(error);

  return removeUndefinedFields({
    type: getString(error, 'type') ?? getString(error, 'name') ?? getConstructorName(error) ?? 'PostgresqlError',
    message: getString(error, 'message') ?? 'Unknown PostgreSQL error',
    stack: getString(error, 'stack'),
    code,
    retryable: code == null ? undefined : isRetryableCode(code),
    severity: getString(error, 'severity'),
    detail: getString(error, 'detail'),
    hint: getString(error, 'hint'),
    position: getString(error, 'position'),
    internalPosition: getString(error, 'internalPosition'),
    where: getString(error, 'where'),
    schema: getString(error, 'schema'),
    table: getString(error, 'table'),
    column: getString(error, 'column'),
    dataType: getString(error, 'dataType'),
    constraint: getString(error, 'constraint'),
    file: getString(error, 'file'),
    line: getString(error, 'line'),
    routine: getString(error, 'routine'),
    details: Object.keys(details).length === 0 ? undefined : details,
    cause: getCause(error),
  });
}

function isRetryableCode(code: string): boolean {
  return code.startsWith('08') || RETRYABLE_POSTGRESQL_CODES.has(code) || RETRYABLE_NETWORK_CODES.has(code);
}

function getNetworkDetails(error: Record<string, unknown>): Record<string, unknown> {
  return removeUndefinedFields({
    errno: getStringOrNumber(error, 'errno'),
    syscall: getString(error, 'syscall'),
    address: getString(error, 'address'),
    port: getStringOrNumber(error, 'port'),
  });
}

export { projectPostgresqlError };
