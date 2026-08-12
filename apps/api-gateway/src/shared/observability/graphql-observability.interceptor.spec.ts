import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { ACCESS_TOKEN_KEY } from '@/modules/auth/constants';
import { RequestContext } from '@big-d/api-utils';
import { ObservabilityContextStorage } from '@big-d/observability/nest';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { ExceptionObservabilityContextNotInitialized } from '@shared/exceptions';
import { ApiGatewayRequestContext } from '@shared/request-context';
import { GraphQLResolveInfo, OperationTypeNode } from 'graphql';
import { firstValueFrom, of } from 'rxjs';
import { GraphqlObservabilityInterceptor } from './graphql-observability.interceptor';

function createExecutionContext(context: AppGraphQLContext): ExecutionContext {
  const info = {
    fieldName: 'updateTask',
    parentType: { name: 'Mutation' },
    operation: { operation: OperationTypeNode.MUTATION },
  } as GraphQLResolveInfo;

  return {
    getType: () => 'graphql',
    getArgs: () => [undefined, {}, context, info],
    getClass: () => class TestResolver {},
    getHandler: () => function testHandler() {},
  } as unknown as ExecutionContext;
}

describe('GraphqlObservabilityInterceptor', () => {
  it('runs the root resolver inside an isolated observability context', async () => {
    const storage = new ObservabilityContextStorage();
    const interceptor = new GraphqlObservabilityInterceptor(storage);
    const context = {
      request: { [ACCESS_TOKEN_KEY]: { uid: 26 } },
      response: {},
      loaders: new Map(),
    } as unknown as AppGraphQLContext;
    const next: CallHandler = {
      handle: () => {
        expect(storage.require()).toEqual({
          trace: { correlationId: 'cid-123' },
          actor: { initiator: 'user', userId: 26 },
          propagation: { userTimezone: 'Asia/Novosibirsk' },
        });
        return of('done');
      },
    };

    await expect(
      ApiGatewayRequestContext.run(
        new RequestContext({
          source: 'http',
          correlationId: 'cid-123',
          userTimezone: 'Asia/Novosibirsk',
        }),
        () => firstValueFrom(interceptor.intercept(createExecutionContext(context), next)),
      ),
    ).resolves.toBe('done');
  });

  it('throws a typed exception when request context is missing', () => {
    const interceptor = new GraphqlObservabilityInterceptor(new ObservabilityContextStorage());
    const context = { request: {}, response: {}, loaders: new Map() } as unknown as AppGraphQLContext;

    expect(() => interceptor.intercept(createExecutionContext(context), { handle: () => of(null) })).toThrow(
      ExceptionObservabilityContextNotInitialized,
    );
  });
});
