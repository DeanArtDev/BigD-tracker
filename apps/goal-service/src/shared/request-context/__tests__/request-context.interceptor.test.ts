import { initTestEnvironment } from '@/../jest.setup';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { defer, firstValueFrom, of } from 'rxjs';
import { GoalServiceRequestContext } from '../app-request-context';
import { RequestContextInterceptor } from '../request-context.interceptor';

initTestEnvironment();

function createExecutionContext(correlationId: string): ExecutionContext {
  return {
    switchToRpc: () => ({
      getContext: () => ({
        getMessage: () => ({
          properties: {
            headers: {
              'x-correlation-id': correlationId,
              'x-user-timezone': 'UTC',
            },
          },
        }),
      }),
    }),
  } as ExecutionContext;
}

describe('RequestContextInterceptor', () => {
  test('keeps correlationId inside deferred handler execution', async () => {
    const interceptor = new RequestContextInterceptor();
    const context = createExecutionContext('cid-from-header');
    const next: CallHandler = {
      handle: () =>
        defer(() => of(GoalServiceRequestContext.getStore()?.correlationId ?? 'There is no correlation id!')),
    };

    const result = await firstValueFrom(interceptor.intercept(context, next));

    expect(result).toBe('cid-from-header');
  });
});
