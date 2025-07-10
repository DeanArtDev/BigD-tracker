import { describe, it, expect } from 'vitest';
import { firstValueFrom, throwError, of } from 'rxjs';
import { ErrorsToRpcExceptionInterceptor } from '../../src/interceptors/errors-to-rpc-exception.interceptor';
import { DomainValidationError, RpcDomainValidationError } from '@big-d/api-contracts';
import { BadRequestException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

describe('ErrorsToRpcExceptionInterceptor', () => {
  const interceptor = new ErrorsToRpcExceptionInterceptor();

  it('maps DomainValidationError to RpcDomainValidationError', async () => {
    const error = new DomainValidationError({ domain: 'd', field: 'f', message: 'm' });
    await expect(
      firstValueFrom(interceptor.intercept({} as any, { handle: () => throwError(() => error) })),
    ).rejects.toBeInstanceOf(RpcDomainValidationError);
  });

  it('maps BadRequestException to RpcException', async () => {
    const error = new BadRequestException('bad');
    await expect(
      firstValueFrom(interceptor.intercept({} as any, { handle: () => throwError(() => error) })),
    ).rejects.toBeInstanceOf(RpcException);
  });

  it('passes through successful value', async () => {
    const result = await firstValueFrom(interceptor.intercept({} as any, { handle: () => of(42) }));
    expect(result).toBe(42);
  });
});
