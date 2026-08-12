import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { ACCESS_TOKEN_KEY } from '@/modules/auth/constants';
import { RequestContext } from '@big-d/api-utils';
import { createObservabilityLogger, type ApplicationLog, type LogWriter } from '@big-d/observability';
import { ApiGatewayRequestContext } from '@shared/request-context';
import type { JwtService } from '@nestjs/jwt';
import { getOperationAST, GraphQLError, parse } from 'graphql';
import { GraphqlObservabilityPlugin, getRootFieldNames } from './graphql-observability.plugin';

class MemoryLogWriter implements LogWriter {
  readonly logs: ApplicationLog[] = [];

  write(log: ApplicationLog): void {
    this.logs.push(log);
  }
}

function createPlugin(writer: MemoryLogWriter, tokenPayload?: { uid: number }): GraphqlObservabilityPlugin {
  const logger = createObservabilityLogger({
    service: { name: 'api-gateway', version: 'test', environment: 'test' },
    writer,
  });
  const jwtService = {
    verifyAsync: jest.fn(() => Promise.resolve(tokenPayload)),
  } as unknown as JwtService;

  return new GraphqlObservabilityPlugin(logger, jwtService);
}

describe('getRootFieldNames', () => {
  it('joins all root fields in document order and ignores aliases', () => {
    const document = parse(`
      mutation UpdateAndCreate {
        updated: updateTask(input: { id: "1" }) { id }
        created: createTask(input: { name: "Task" }) { id }
      }
    `);
    const operation = getOperationAST(document, 'UpdateAndCreate');

    expect(operation).toBeDefined();
    expect(getRootFieldNames(document, operation!)).toEqual(['updateTask', 'createTask']);
  });

  it('resolves root fields declared through fragments', () => {
    const document = parse(`
      mutation UpdateAndCreate {
        ...TaskOperations
      }

      fragment TaskOperations on Mutation {
        updateTask(input: { id: "1" }) { id }
        createTask(input: { name: "Task" }) { id }
      }
    `);
    const operation = getOperationAST(document, 'UpdateAndCreate');

    expect(operation).toBeDefined();
    expect(getRootFieldNames(document, operation!)).toEqual(['updateTask', 'createTask']);
  });
});

describe('GraphqlObservabilityPlugin', () => {
  it.each([
    ['schema', `query IntrospectionQuery { __schema { queryType { name } } }`],
    ['type', `query TypeQuery { __type(name: "TaskSchema") { name } }`],
  ])('does not log %s introspection queries', async (_, source) => {
    const writer = new MemoryLogWriter();
    const plugin = createPlugin(writer);
    const document = parse(source);
    const operation = getOperationAST(document);
    if (operation == null) throw new Error('Operation is missing in test document');

    const listener = await plugin.requestDidStart();
    await listener.didResolveOperation?.({
      contextValue: { request: {}, response: {}, loaders: new Map() },
      document,
      operation,
      request: {},
    } as never);
    await listener.willSendResponse?.({
      response: {
        body: { kind: 'single', singleResult: { data: {} } },
      },
    } as never);

    expect(writer.logs).toEqual([]);
  });

  it('does not log subscriptions', async () => {
    const writer = new MemoryLogWriter();
    const plugin = createPlugin(writer);
    const document = parse(`subscription TaskChanged { taskChanged { id } }`);
    const operation = getOperationAST(document, 'TaskChanged');
    if (operation == null) throw new Error('Operation is missing in test document');

    await ApiGatewayRequestContext.run(
      new RequestContext({ source: 'http', correlationId: 'cid-subscription' }),
      async () => {
        const listener = await plugin.requestDidStart();
        await listener.didResolveOperation?.({
          contextValue: { request: {}, response: {}, loaders: new Map() },
          document,
          operation,
          operationName: 'TaskChanged',
          request: {},
        } as never);
        await listener.willSendResponse?.({
          response: {
            body: { kind: 'single', singleResult: { data: { taskChanged: { id: 'o::431' } } } },
          },
        } as never);
      },
    );

    expect(writer.logs).toEqual([]);
  });

  it('logs multiple root fields as one successful operation', async () => {
    const writer = new MemoryLogWriter();
    const plugin = createPlugin(writer, { uid: 26 });
    const document = parse(`mutation ChangeTasks { updateTask { id } createTask { id } }`);
    const operation = getOperationAST(document, 'ChangeTasks');
    if (operation == null) throw new Error('Operation is missing in test document');
    const contextValue = {
      request: { cookies: { [ACCESS_TOKEN_KEY]: 'valid-access-token' } },
      response: {},
      loaders: new Map(),
    } as unknown as AppGraphQLContext;

    await ApiGatewayRequestContext.run(
      new RequestContext({ source: 'http', correlationId: 'cid-123', userTimezone: 'Asia/Novosibirsk' }),
      async () => {
        const listener = await plugin.requestDidStart();
        await listener.didResolveOperation?.({
          contextValue,
          document,
          operation,
          operationName: 'ChangeTasks',
          request: { variables: { input: { id: 'o::431' } } },
        } as never);
        await listener.willSendResponse?.({
          response: {
            body: {
              kind: 'single',
              singleResult: { data: { updateTask: {}, createTask: {} } },
            },
          },
        } as never);
      },
    );

    expect(writer.logs).toHaveLength(2);
    expect(writer.logs[0]).toMatchObject({
      message: 'graphql.request',
      actor: { initiator: 'user', userId: 26 },
      event: { name: 'graphql.updateTask.createTask' },
      transport: {
        operation: 'Mutation.updateTask.createTask',
        fieldName: 'updateTask.createTask',
      },
      request: { payload: { input: { id: 'o::431' } } },
    });
    expect(writer.logs[1]).toMatchObject({ event: { outcome: 'success' } });
  });

  it('logs the original controlled error when the response has errors without data', async () => {
    const writer = new MemoryLogWriter();
    const plugin = createPlugin(writer);
    const document = parse(`mutation UpdateTask { updateTask { id } }`);
    const operation = getOperationAST(document, 'UpdateTask');
    if (operation == null) throw new Error('Operation is missing in test document');
    const originalError = Object.assign(new Error('Task infrastructure error'), {
      key: 'TASK_INFRASTRUCTURE_ERROR',
      code: 'GT-I-0000',
    });
    const graphqlError = new GraphQLError('Public error', { originalError });

    await ApiGatewayRequestContext.run(new RequestContext({ source: 'http', correlationId: 'cid-error' }), async () => {
      const listener = await plugin.requestDidStart();
      await listener.didResolveOperation?.({
        contextValue: { request: { cookies: {} }, response: {}, loaders: new Map() },
        document,
        operation,
        operationName: 'UpdateTask',
        request: {},
      } as never);
      await listener.didEncounterErrors?.({ errors: [graphqlError] } as never);
      await listener.willSendResponse?.({
        response: {
          body: { kind: 'single', singleResult: { errors: [{ message: 'Public error' }] } },
        },
      } as never);
    });

    expect(writer.logs[1]).toMatchObject({
      event: { outcome: 'failure' },
      error: {
        message: 'Task infrastructure error',
        key: 'TASK_INFRASTRUCTURE_ERROR',
        code: 'GT-I-0000',
      },
    });
  });
});
