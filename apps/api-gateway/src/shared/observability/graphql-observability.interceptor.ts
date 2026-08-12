import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { ACCESS_TOKEN_KEY } from '@/modules/auth/constants';
import { ObservabilityContextStorage } from '@big-d/observability/nest';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ExceptionObservabilityContextNotInitialized } from '@shared/exceptions';
import { ApiGatewayRequestContext } from '@shared/request-context';
import { GraphQLResolveInfo } from 'graphql';
import type { Observable } from 'rxjs';
import { getObservabilityActor } from './helpers';

const ROOT_GRAPHQL_TYPES = new Set(['Query', 'Mutation']);

@Injectable()
class GraphqlObservabilityInterceptor implements NestInterceptor {
  constructor(private readonly contextStorage: ObservabilityContextStorage) {}

  intercept(executionContext: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (executionContext.getType<GqlContextType>() !== 'graphql') return next.handle();

    const graphqlContext = GqlExecutionContext.create(executionContext);
    const info = graphqlContext.getInfo<GraphQLResolveInfo>();
    if (!ROOT_GRAPHQL_TYPES.has(info.parentType.name)) return next.handle();

    const context = graphqlContext.getContext<AppGraphQLContext>();
    const requestContext = ApiGatewayRequestContext.getStore();
    if (requestContext == null) {
      throw new ExceptionObservabilityContextNotInitialized({
        message: 'ApiGatewayRequestContext is not initialized',
      });
    }

    // Shape context for RMQ messaging
    return this.contextStorage.run(
      {
        trace: { correlationId: requestContext.correlationId },
        actor: getObservabilityActor(context.request[ACCESS_TOKEN_KEY]),
        propagation: { userTimezone: requestContext.state.userTimezone },
      },
      () => next.handle(),
    );
  }
}

export { GraphqlObservabilityInterceptor };
