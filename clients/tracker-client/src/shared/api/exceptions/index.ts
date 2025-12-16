class ClientTimeoutError extends Error {
  name = 'ClientTimeoutError';
  code = 'ECONNABORTED';
  constructor(timeout: number) {
    super(`Timeout of ${timeout}ms exceeded`);
  }
}

export { ClientTimeoutError };
