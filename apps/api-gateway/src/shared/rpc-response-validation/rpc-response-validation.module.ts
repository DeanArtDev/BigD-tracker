import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RpcResponseValidationInterceptor } from './rpc-response-validation.interceptor';
import { RPC_VALIDATOR_ERROR_FACTORY } from './tokens';
import { RpcResponseErrorFactory } from './types';

@Module({})
export class RpcResponseValidationModule {
  static forFeature(options: { useValue: RpcResponseErrorFactory }): DynamicModule {
    return {
      module: RpcResponseValidationModule,
      providers: [
        {
          provide: RPC_VALIDATOR_ERROR_FACTORY,
          useValue: options.useValue,
        },
        { provide: APP_INTERCEPTOR, useClass: RpcResponseValidationInterceptor },
      ],
    };
  }
}
