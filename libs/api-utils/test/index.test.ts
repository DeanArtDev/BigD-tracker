import { describe, it, expect } from 'vitest';
import * as index from '../src';
import { Email } from '../src/value-objects';
import { DomainValidator } from '../src/domain-validator';
import { BaseMapper } from '../src/mapper';
import { LoggerMiddleware } from '../src/middlewares';
import { ErrorsToRpcExceptionInterceptor } from '../src/interceptors';
import { KyselyUnitOfWork } from '../src/uow';
import { BaseRepository } from '../src/repository';
import { RmqLoggerSerializer } from '../src/loggers';

describe('api-utils index exports', () => {
  it('re-exports modules', () => {
    expect(index.Email).toBe(Email);
    expect(index.DomainValidator).toBe(DomainValidator);
    expect(index.BaseMapper).toBe(BaseMapper);
    expect(index.LoggerMiddleware).toBe(LoggerMiddleware);
    expect(index.ErrorsToRpcExceptionInterceptor).toBe(ErrorsToRpcExceptionInterceptor);
    expect(index.KyselyUnitOfWork).toBe(KyselyUnitOfWork);
    expect(index.BaseRepository).toBe(BaseRepository);
    expect(index.RmqLoggerSerializer).toBe(RmqLoggerSerializer);
  });
});
