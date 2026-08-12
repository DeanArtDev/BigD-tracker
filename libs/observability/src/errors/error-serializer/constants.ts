const DEFAULT_MAX_ERROR_DEPTH = 8;
const CIRCULAR_REFERENCE_TYPE = 'CircularErrorReference';
const CIRCULAR_REFERENCE_MESSAGE = '[Circular error reference]';

const KNOWN_ERROR_FIELDS = new Set([
  'name',
  'type',
  'message',
  'stack',
  'key',
  'code',
  'operation',
  'retryable',
  'constraint',
  'severity',
  'schema',
  'table',
  'column',
  'dataType',
  'detail',
  'hint',
  'position',
  'internalPosition',
  'where',
  'file',
  'line',
  'routine',
  'details',
  'cause',
]);

const NESTED_CAUSE_FIELDS = ['error', 'cause', 'originalError'] as const;
const NESTED_CAUSE_FIELD_SET = new Set<string>(NESTED_CAUSE_FIELDS);
const OMITTED_ERROR_DETAIL_FIELDS = new Set(['correlationId']);

export {
  CIRCULAR_REFERENCE_MESSAGE,
  CIRCULAR_REFERENCE_TYPE,
  DEFAULT_MAX_ERROR_DEPTH,
  KNOWN_ERROR_FIELDS,
  NESTED_CAUSE_FIELDS,
  NESTED_CAUSE_FIELD_SET,
  OMITTED_ERROR_DETAIL_FIELDS,
};
