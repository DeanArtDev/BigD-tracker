import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { isEmpty } from 'lodash';
import { z } from 'zod';
import { ExceptionRequestContextPayload } from './exceptions';
import { TOKEN_PAYLOAD_HEADER_KEY } from './constants';

const CORRELATION_HEADER_KEY = 'x-correlation-id';

const schema = z.object({
  uid: z.number(),
});

@Injectable()
class RequestContextPayloadGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const rmq = context.switchToRpc().getContext<RmqContext>();
    const msg = rmq.getMessage();

    const headers = msg.properties?.headers;
    if (!headers || !headers[CORRELATION_HEADER_KEY] || isEmpty(headers[CORRELATION_HEADER_KEY])) {
      throw new ExceptionRequestContextPayload({ message: 'There is no correlation id' });
    }
    const tokenPayload = JSON.parse(
      String(msg.properties?.headers?.[TOKEN_PAYLOAD_HEADER_KEY] ?? '{}'),
    );
    if (!schema.safeParse(tokenPayload).success) {
      throw new ExceptionRequestContextPayload({ message: 'There is no uid' });
    }

    return true;
  }
}

export { CORRELATION_HEADER_KEY, RequestContextPayloadGuard };
