import { decodeActorHeaders, type ObservabilityLogger } from '@big-d/observability';
import { OBSERVABILITY_LOGGER, ObservabilityContextStorage } from '@big-d/observability/nest';
import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { TrainingServiceRequestContext } from '@shared/request-context';
import { ExceptionRequestContextPayload } from '@shared/request-context/exceptions';
import { Observable } from 'rxjs';

@Injectable()
class RmqObservabilityInterceptor implements NestInterceptor {
  constructor(
    @Inject(OBSERVABILITY_LOGGER) private readonly logger: ObservabilityLogger,
    private readonly contextStorage: ObservabilityContextStorage,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const requestContext = TrainingServiceRequestContext.getStore();
    if (requestContext == null) {
      throw new ExceptionRequestContextPayload({
        message: 'TrainingServiceRequestContext is not initialized',
      });
    }

    const rmqContext = context.switchToRpc().getContext<RmqContext>();
    const message = rmqContext.getMessage();
    const pattern = rmqContext.getPattern();
    const headers = (message?.properties?.headers ?? {}) as Record<string, unknown>;
    const observabilityContext = {
      trace: { correlationId: requestContext.correlationId },
      actor: decodeActorHeaders(headers),
      propagation: { userTimezone: requestContext.state.userTimezone },
    };

    return new Observable((subscriber) =>
      this.contextStorage.run(observabilityContext, () => {
        const scope = this.logger.withContext(observabilityContext).startOperation({
          name: pattern,
          transport: {
            type: 'rmq',
            direction: 'inbound',
            operation: pattern,
            routingKey: pattern,
            ...(message?.properties?.messageId == null ? {} : { messageId: String(message.properties.messageId) }),
            ...(typeof message?.fields?.deliveryTag === 'number' ? { deliveryTag: message.fields.deliveryTag } : {}),
            ...(typeof message?.fields?.redelivered === 'boolean' ? { redelivered: message.fields.redelivered } : {}),
          },
          request: { payload: context.switchToRpc().getData<unknown>() },
        });
        let completed = false;

        try {
          const subscription = next.handle().subscribe({
            next: (value) => subscriber.next(value),
            error: (error: unknown) => {
              if (!completed) {
                scope.failure(error);
                completed = true;
              }
              subscriber.error(error);
            },
            complete: () => {
              if (!completed) {
                scope.success();
                completed = true;
              }
              subscriber.complete();
            },
          });

          return () => subscription.unsubscribe();
        } catch (error) {
          scope.failure(error);
          subscriber.error(error);
        }
      }),
    );
  }
}

export { RmqObservabilityInterceptor };
