interface BaseExceptionState<
  TKey extends string,
  TCode extends string,
  TDetails extends Record<string, any> = Record<string, any>,
> {
  readonly key: TKey;
  readonly code: TCode;
  readonly details: TDetails;
}

class BaseException<
  TKey extends string,
  TCode extends string,
  TDetails extends Record<string, any>,
> extends Error {
  public timestamp: string;
  public key: TKey;
  public code: TCode;
  public details: TDetails;

  public constructor(state: BaseExceptionState<TKey, TCode, TDetails>) {
    super(state.key);
    this.timestamp = new Date().toISOString();
    this.key = state.key;
    this.code = state.code;
    this.details = state.details;
  }

  public toString() {
    return `${this.key}(${this.code})`;
  }

  public toResponse(): {
    key: TKey;
    code: TCode;
    details: { timestamp: string } & TDetails;
  } {
    return {
      key: this.key,
      code: this.code,
      details: { ...this.details, timestamp: this.timestamp },
    };
  }
}

function isBaseException(error: unknown): error is BaseException<string, string, any> {
  return error instanceof BaseException;
}

export { BaseException, isBaseException, BaseExceptionState };
