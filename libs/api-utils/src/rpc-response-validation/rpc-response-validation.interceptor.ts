import {
  BadGatewayException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { map, Observable } from 'rxjs';
import { RPC_RESPONSE_SCHEMA } from './validate-rpc-response.decorator';

@Injectable()
export class RpcResponseValidationInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

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
        console.log(data);
        const instance = plainToInstance(schema, data, {
          excludeExtraneousValues: true,
        });

        const errors = await validate(instance, {
          whitelist: true,
          forbidNonWhitelisted: false,
        });

        if (errors.length > 0) {
          throw new BadGatewayException({
            message: 'Invalid response from RPC microservice',
            errors,
          });
        }

        return instance;
      }),
    );
  }
}
