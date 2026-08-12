import type { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { getAccessToken } from '@/modules/auth/decorators';
import type { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import type { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { type ObservabilityLogger } from '@big-d/observability';
import { OBSERVABILITY_LOGGER } from '@big-d/observability/nest';
import { Inject, Injectable } from '@nestjs/common';
import { Plugin } from '@nestjs/apollo';
import { JwtService } from '@nestjs/jwt';
import { ExceptionObservabilityContextNotInitialized } from '@shared/exceptions';
import { ApiGatewayRequestContext } from '@shared/request-context';
import {
  Kind,
  OperationTypeNode,
  type DocumentNode,
  type GraphQLError,
  type OperationDefinitionNode,
  type SelectionSetNode,
} from 'graphql';
import { getObservabilityActor } from './helpers';

@Plugin()
@Injectable()
class GraphqlObservabilityPlugin implements ApolloServerPlugin<AppGraphQLContext> {
  constructor(
    @Inject(OBSERVABILITY_LOGGER) private readonly logger: ObservabilityLogger,
    private readonly jwtService: JwtService,
  ) {}

  requestDidStart(): Promise<GraphQLRequestListener<AppGraphQLContext>> {
    let scope: { success(): boolean; failure(error: unknown): boolean } | undefined;
    let errors: readonly GraphQLError[] = [];

    return Promise.resolve({
      didResolveOperation: async ({ contextValue, document, operation, operationName, request }) => {
        if (operation == null) return Promise.resolve();
        if (operation.operation === OperationTypeNode.SUBSCRIPTION) return Promise.resolve();

        const fieldNames = getRootFieldNames(document, operation);
        if (isIntrospectionOperation(fieldNames)) return Promise.resolve();

        const requestContext = ApiGatewayRequestContext.getStore();
        if (requestContext == null) {
          throw new ExceptionObservabilityContextNotInitialized({
            message: 'ApiGatewayRequestContext is not initialized',
          });
        }

        const fieldName = fieldNames.join('.');
        const operationType = operation.operation;
        const contextualLogger = this.logger.withContext({
          trace: { correlationId: requestContext.correlationId },
          actor: await this.getActor(contextValue),
          propagation: { userTimezone: requestContext.state.userTimezone },
        });

        scope = contextualLogger.startOperation({
          name: `graphql.${fieldName}`,
          transport: {
            type: 'graphql',
            direction: 'inbound',
            operation: `${getRootTypeName(operationType)}.${fieldName}`,
            operationType,
            ...(operationName == null ? {} : { operationName }),
            fieldName,
          },
          request: { payload: request.variables ?? {} },
        });
      },
      didEncounterErrors: (context) => {
        errors = context.errors;
        return Promise.resolve();
      },
      willSendResponse: ({ response }) => {
        if (scope == null || response.body.kind !== 'single') return Promise.resolve();

        const result = response.body.singleResult;
        if (result.data != null || result.errors == null || result.errors.length === 0) {
          scope.success();
          return Promise.resolve();
        }

        const error = errors[0];
        scope.failure(error?.originalError ?? error ?? result.errors[0]);
        return Promise.resolve();
      },
    });
  }

  private async getActor(context: AppGraphQLContext) {
    const accessToken = getAccessToken(context.request);
    if (accessToken == null) return getObservabilityActor(undefined);

    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(accessToken);
      return getObservabilityActor(payload);
    } catch {
      return getObservabilityActor(undefined);
    }
  }
}

function isIntrospectionOperation(fieldNames: readonly string[]): boolean {
  return fieldNames.length > 0 && fieldNames.every((fieldName) => fieldName.startsWith('__'));
}

function getRootFieldNames(document: DocumentNode, operation: OperationDefinitionNode): string[] {
  const fragments = new Map(
    document.definitions
      .filter((definition) => definition.kind === Kind.FRAGMENT_DEFINITION)
      .map((fragment) => [fragment.name.value, fragment.selectionSet]),
  );

  return collectFieldNames(operation.selectionSet, fragments, new Set<string>());
}

function collectFieldNames(
  selectionSet: SelectionSetNode,
  fragments: ReadonlyMap<string, SelectionSetNode>,
  visitedFragments: Set<string>,
): string[] {
  return selectionSet.selections.flatMap((selection) => {
    if (selection.kind === Kind.FIELD) return [selection.name.value];
    if (selection.kind === Kind.INLINE_FRAGMENT) {
      return collectFieldNames(selection.selectionSet, fragments, visitedFragments);
    }

    if (visitedFragments.has(selection.name.value)) return [];
    const fragment = fragments.get(selection.name.value);
    if (fragment == null) return [];

    visitedFragments.add(selection.name.value);
    return collectFieldNames(fragment, fragments, visitedFragments);
  });
}

function getRootTypeName(operationType: OperationTypeNode.QUERY | OperationTypeNode.MUTATION): 'Query' | 'Mutation' {
  switch (operationType) {
    case OperationTypeNode.QUERY:
      return 'Query';
    case OperationTypeNode.MUTATION:
      return 'Mutation';
  }
}

export { GraphqlObservabilityPlugin, getRootFieldNames };
