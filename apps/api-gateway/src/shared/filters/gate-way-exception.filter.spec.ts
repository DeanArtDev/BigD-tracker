import { BaseRpcException, RmqErrorKind } from '@big-d/api-contracts';
import { RequestContext } from '@big-d/api-utils';
import { ArgumentsHost, InternalServerErrorException } from '@nestjs/common';
import { ApiGatewayRequestContext } from '../request-context';
import { GateWayExceptionFilter } from './gate-way-exception.filter';

function createHost() {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  } as ArgumentsHost;

  return { host, response };
}

describe('GateWayExceptionFilter', () => {
  test('adds correlationId to rpc error responses', () => {
    const filter = new GateWayExceptionFilter();
    const { host, response } = createHost();

    ApiGatewayRequestContext.run(
      new RequestContext({
        correlationId: 'cid-gateway',
        source: 'http',
      }),
      () => {
        filter.catch(
          new BaseRpcException({
            key: 'TASK_INFRASTRUCTURE_ERROR',
            code: 'GT-I-0000',
            kind: RmqErrorKind.INTERNAL,
            details: {
              message: 'Task infrastructure error',
              timestamp: '2026-03-09T00:00:00.000Z',
            },
          }),
          host,
        );
      },
    );

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      key: 'TASK_INFRASTRUCTURE_ERROR',
      code: 'GT-I-0000',
      details: {
        correlationId: 'cid-gateway',
        message: 'Task infrastructure error',
        timestamp: '2026-03-09T00:00:00.000Z',
      },
    });
  });

  test('adds correlationId to plain http exception responses', () => {
    const filter = new GateWayExceptionFilter();
    const { host, response } = createHost();

    ApiGatewayRequestContext.run(
      new RequestContext({
        correlationId: 'cid-http',
        source: 'http',
      }),
      () => {
        filter.catch(new InternalServerErrorException('boom'), host);
      },
    );

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'boom',
      error: 'Internal Server Error',
      details: {
        correlationId: 'cid-http',
      },
    });
  });
});
