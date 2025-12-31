function isDefaultRpcError(error: unknown): error is { error: unknown; message: string } {
  return typeof error === 'object' && error != null && 'error' in error && 'message' in error;
}

function unwrapDefaultRpcError(error: unknown): unknown {
  if (isDefaultRpcError(error)) {
    return error.error;
  }
  return undefined;
}

export { isDefaultRpcError, unwrapDefaultRpcError };
