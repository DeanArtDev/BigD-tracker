class DomainValidationError extends Error {
  public domain: string;
  public field: string;

  public constructor(data: {
    domain: string;
    field: string;
    message: string;
    options?: ConstructorParameters<typeof Error>[1];
  }) {
    super(data.message, data.options);
    this.domain = data.domain;
    this.field = data.field;
    this.field = data.field;
    this.message = data.message;
  }
}

export { DomainValidationError };
