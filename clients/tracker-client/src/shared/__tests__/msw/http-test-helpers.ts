import { http, HttpResponse } from 'msw';
import { server } from './server';

type ResponseFactory<TResponse extends object> = TResponse | (() => TResponse);

export interface JsonRequestSpy<TBody> {
  getCallCount: () => number;
  getBodies: () => TBody[];
  getLastBody: () => TBody | undefined;
}

interface MockJsonPostOptions<TBody, TResponse extends object> {
  path: string;
  response: ResponseFactory<TResponse>;
  status?: number;
  onRequest?: (body: TBody) => void;
}

interface MockDeleteOptions<TResponse extends object> {
  path: string;
  response: ResponseFactory<TResponse>;
  status?: number;
}

interface MockPostOptions<TResponse extends object> {
  path: string;
  response: ResponseFactory<TResponse>;
  status?: number;
}

type JsonMethod = 'post' | 'put';

function mockJsonRequest<TBody, TResponse extends object>({
  method,
  path,
  response,
  status = 200,
  onRequest,
}: MockJsonPostOptions<TBody, TResponse> & { method: JsonMethod }): JsonRequestSpy<TBody> {
  const methodHandler = method === 'post' ? http.post : http.put;
  let callCount = 0;
  const bodies: TBody[] = [];

  server.use(
    methodHandler(path, async ({ request }) => {
      callCount += 1;
      const body = (await request.json()) as TBody;
      bodies.push(body);
      onRequest?.(body);

      const payload = typeof response === 'function' ? (response as () => TResponse)() : response;

      return HttpResponse.json(payload, { status });
    }),
  );

  return {
    getCallCount: () => callCount,
    getBodies: () => bodies,
    getLastBody: () => bodies.at(-1),
  };
}

export function mockJsonPost<TBody, TResponse extends object>({
  path,
  response,
  status = 200,
  onRequest,
}: MockJsonPostOptions<TBody, TResponse>): JsonRequestSpy<TBody> {
  return mockJsonRequest({
    method: 'post',
    path,
    response,
    status,
    onRequest,
  });
}

export function mockJsonPut<TBody, TResponse extends object>({
  path,
  response,
  status = 200,
  onRequest,
}: MockJsonPostOptions<TBody, TResponse>): JsonRequestSpy<TBody> {
  return mockJsonRequest({
    method: 'put',
    path,
    response,
    status,
    onRequest,
  });
}

export function mockDelete<TResponse extends object>({ path, response, status = 200 }: MockDeleteOptions<TResponse>) {
  let callCount = 0;

  server.use(
    http.delete(path, async () => {
      callCount += 1;
      const payload = typeof response === 'function' ? (response as () => TResponse)() : response;

      return HttpResponse.json(payload, { status });
    }),
  );

  return {
    getCallCount: () => callCount,
  };
}

export function mockPost<TResponse extends object>({ path, response, status = 200 }: MockPostOptions<TResponse>) {
  let callCount = 0;

  server.use(
    http.post(path, async () => {
      callCount += 1;
      const payload = typeof response === 'function' ? (response as () => TResponse)() : response;

      return HttpResponse.json(payload, { status });
    }),
  );

  return {
    getCallCount: () => callCount,
  };
}
