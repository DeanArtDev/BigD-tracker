import { ApiErrorCode, ApiErrorKey } from '@/shared/transport/graphql';

interface ApiErrorState<
  TCode extends ApiErrorCode = ApiErrorCode,
  Details extends Record<string, unknown> = Record<string, unknown>,
> {
  readonly key: ApiErrorKey;
  readonly code: TCode;
  readonly message: string;
  readonly correlationId: string;
  readonly path?: ReadonlyArray<string | number>;
  readonly details?: Details;
}

class ApiError<
  TCode extends ApiErrorCode = ApiErrorCode,
  Details extends Record<string, unknown> = Record<string, unknown>,
> extends Error {
  #brand = 'ApiError';
  #state: ApiErrorState<TCode, Details>;

  constructor(input: ApiErrorState<TCode, Details>) {
    super(`${input.message}, code: ${input.code}`);
    this.#state = input;
  }

  get key() {
    return this.#state.key;
  }
  get code() {
    return this.#state.code;
  }
  get message() {
    return this.#state.message;
  }
  get correlationId() {
    return this.#state.correlationId;
  }
  get path() {
    return this.#state.path;
  }
  get details() {
    return this.#state.details;
  }
}

export { ApiError };
