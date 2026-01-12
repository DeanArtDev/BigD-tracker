/**
 * @deprecated use BaseException
 * */
class DomainValidationError extends Error {
  public domain: string;
  public field: string;

  public constructor(data: { domain: string; field: string; message: string }) {
    super(data.message);
    this.domain = data.domain;
    this.field = data.field;
    this.message = data.message;
  }
}

export { DomainValidationError };
