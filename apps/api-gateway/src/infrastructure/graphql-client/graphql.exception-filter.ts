import { AppGraphQLError } from '@/infrastructure/graphql-client/exceptions';
import { isBaseRpcException, unwrapDefaultRpcException } from '@big-d/api-contracts';
import { isBaseException } from '@big-d/exceptions';
import { Catch, HttpException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { ApiGatewayRequestContext } from '@shared/request-context';
import { GraphQLError } from 'graphql';

export type GqlErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'BAD_REQUEST'
  | 'INTERNAL';

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exc: unknown): AppGraphQLError {
    const exception = unwrapDefaultRpcException(exc) ?? exc;

    if (exception instanceof AppGraphQLError) return exception;

    if (exception instanceof GraphQLError) return exception;

    if (isBaseException(exception)) {
      return new AppGraphQLError({
        message: exception.message,
        key: exception.key,
        code: exception.code,
        correlationId: this.#getCorrelationId(),
        details: { ...(exception.details ?? {}), timestamp: exception.timestamp },
      });
    }

    if (isBaseRpcException(exception)) {
      const rpcExcState = exception.toResponse();

      return new AppGraphQLError({
        message: String(exception),
        key: rpcExcState.key,
        code: rpcExcState.code,
        correlationId: this.#getCorrelationId(),
        details: rpcExcState.details ?? {},
      });
    }

    if (exception instanceof HttpException) {
      return new AppGraphQLError({
        key: 'HTTP_EXCEPTION',
        code: 'XX-X-0000',
        message: String(exception),
        correlationId: this.#getCorrelationId(),
        details: {
          status: exception.getStatus(),
          httpResponse: exception.getResponse(),
        },
      });
    }

    return new AppGraphQLError({
      key: 'INTERNAL',
      code: 'XX-X-0000',
      message: 'Internal server error',
      correlationId: this.#getCorrelationId(),
      details: {},
    });
  }

  #getCorrelationId() {
    return ApiGatewayRequestContext.getStore()?.correlationId ?? 'Unknown correlationId!';
  }
}
