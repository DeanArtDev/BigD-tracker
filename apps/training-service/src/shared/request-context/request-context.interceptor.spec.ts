import { CORRELATION_HEADER_KEY, USER_TIME_ZONE_HEADER_KEY } from '@big-d/observability';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { firstValueFrom, of } from 'rxjs';
import { TrainingServiceRequestContext } from './app-request-context';
import { RequestContextInterceptor } from './request-context.interceptor';

describe('RequestContextInterceptor', () => {
  it('creates an isolated training request context from RMQ headers', async () => {
    const message = {
      properties: {
        headers: {
          [CORRELATION_HEADER_KEY]: 'cid-123',
          [USER_TIME_ZONE_HEADER_KEY]: 'Asia/Novosibirsk',
        },
      },
    };
    const rmqContext = new RmqContext([message, {}, 'training.get']);
    const executionContext = {
      switchToRpc: () => ({ getContext: () => rmqContext }),
    } as unknown as ExecutionContext;
    const next: CallHandler = {
      handle: () => {
        expect(TrainingServiceRequestContext.getStore()).toMatchObject({
          correlationId: 'cid-123',
          state: {
            correlationId: 'cid-123',
            source: 'rmq',
            userTimezone: 'Asia/Novosibirsk',
          },
        });
        return of('done');
      },
    };

    await expect(firstValueFrom(new RequestContextInterceptor().intercept(executionContext, next))).resolves.toBe(
      'done',
    );
    expect(TrainingServiceRequestContext.getStore()).toBeUndefined();
  });
});
