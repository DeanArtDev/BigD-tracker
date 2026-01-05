import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RpcResponseErrorFactory } from '@shared/rpc-response-validation/types';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { map, Observable } from 'rxjs';
import { RPC_VALIDATOR_ERROR_FACTORY } from './tokens';
import { RPC_RESPONSE_SCHEMA } from './validate-rpc-response.decorator';

@Injectable()
export class RpcResponseValidationInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @Inject(RPC_VALIDATOR_ERROR_FACTORY) private readonly errorFactory: RpcResponseErrorFactory,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const schema = this.reflector.get<ClassConstructor<any>>(
      RPC_RESPONSE_SCHEMA,
      context.getHandler(),
    );

    if (!schema) {
      return next.handle();
    }

    return next.handle().pipe(
      map(async (data) => {
        const instance = plainToInstance<ClassConstructor<any>, any>(schema, data, {
          excludeExtraneousValues: true,
        });

        const issues = await validate(instance, {
          whitelist: true,
          forbidNonWhitelisted: false,
        });

        if (issues.length > 0) {
          throw this.errorFactory({ issues });
        }

        return instance;
      }),
    );
  }
}
