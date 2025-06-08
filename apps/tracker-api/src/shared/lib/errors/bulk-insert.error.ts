class BulkInsertFailedError extends Error {
  constructor(message = 'Bulk creation failed') {
    super(message);
    this.name = 'BulkInsertFailedError';
  }
}

export { BulkInsertFailedError };
