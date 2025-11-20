import { ClientTimeoutError } from './exceptions';

function customFetchFabric(options: { timeout?: number }) {
  const { timeout = 10000 } = options ?? {};

  return (request: Request, init?: RequestInit & { timeout?: number }) => {
    const controller = new AbortController();

    const signals = [controller.signal];

    if (request.signal != null) signals.push(request.signal);
    if (init?.signal != null) signals.push(init?.signal);
    const signal = AbortSignal.any(signals);

    const id = setTimeout(() => void controller.abort(new ClientTimeoutError(timeout)), timeout);

    return fetch(request, { ...init, signal }).finally(() => {
      id != null && clearTimeout(id);
    });
  };
}

export { customFetchFabric };
