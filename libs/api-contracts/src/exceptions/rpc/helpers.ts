function isDefaultRpcException(error: unknown): error is { error: unknown; message: string } {
  return typeof error === 'object' && error != null && 'error' in error && 'message' in error;
}

function unwrapDefaultRpcException(error: unknown): unknown {
  if (isDefaultRpcException(error)) {
    return error.error;
  }
  return undefined;
}

export { isDefaultRpcException, unwrapDefaultRpcException };
