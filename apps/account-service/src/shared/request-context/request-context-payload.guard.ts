import { CORRELATION_HEADER_KEY } from '@big-d/api-utils';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { ExceptionRequestContextPayload } from './exceptions';

@Injectable()
class RequestContextPayloadGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const rmq = context.switchToRpc().getContext<RmqContext>();
    const msg = rmq.getMessage();

    const headers = msg.properties?.headers;
    if (!headers || !headers[CORRELATION_HEADER_KEY]) {
      throw new ExceptionRequestContextPayload({ message: 'There is no correlation id' });
    }

    return true;
  }
}

export { CORRELATION_HEADER_KEY, RequestContextPayloadGuard };
