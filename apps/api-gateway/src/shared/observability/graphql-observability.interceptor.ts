import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { ACCESS_TOKEN_KEY } from '@/modules/auth/constants';
import { ObservabilityContextStorage } from '@big-d/observability/nest';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ExceptionObservabilityContextNotInitialized } from '@shared/exceptions';
import { ApiGatewayRequestContext } from '@shared/request-context';
import { Observable } from 'rxjs';
import { getObservabilityActor } from './helpers';

@Injectable()
class GraphqlObservabilityInterceptor implements NestInterceptor {
  constructor(private readonly contextStorage: ObservabilityContextStorage) {}

  intercept(executionContext: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (executionContext.getType<GqlContextType>() !== 'graphql') return next.handle();

    const graphqlContext = GqlExecutionContext.create(executionContext);
    const context = graphqlContext.getContext<AppGraphQLContext>();
    const requestContext = ApiGatewayRequestContext.getStore();
    if (requestContext == null) {
      throw new ExceptionObservabilityContextNotInitialized({
        message: 'ApiGatewayRequestContext is not initialized',
      });
    }

    const observabilityContext = {
      trace: { correlationId: requestContext.correlationId },
      actor: getObservabilityActor(context.request[ACCESS_TOKEN_KEY]),
      propagation: { userTimezone: requestContext.state.userTimezone },
    };

    return new Observable((subscriber) =>
      this.contextStorage.run(observabilityContext, () => next.handle().subscribe(subscriber)),
    );
  }
}

export { GraphqlObservabilityInterceptor };
