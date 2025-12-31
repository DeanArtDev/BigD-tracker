enum RmqErrorKind {
  // 4xx
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  FAILED_PRECONDITION = 'FAILED_PRECONDITION',
  OUT_OF_RANGE = 'OUT_OF_RANGE',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  ABORTED = 'ABORTED',
  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',
  CANCELLED = 'CANCELLED',

  // 5xx
  INTERNAL = 'INTERNAL',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  UNAVAILABLE = 'UNAVAILABLE',
  DEADLINE_EXCEEDED = 'DEADLINE_EXCEEDED',
  DATA_LOSS = 'DATA_LOSS',
}

type DefineApiException<
  TKey extends string,
  TCode extends number,
  TKind extends RmqErrorKind,
  TDetails extends Record<string, any> | undefined = Record<string, any>,
> = {
  readonly key: TKey;
  readonly code: TCode;
  readonly kind: TKind;
  readonly details: TDetails;
};

export { RmqErrorKind, DefineApiException };
