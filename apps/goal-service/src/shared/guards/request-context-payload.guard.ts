import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RmqContext, RpcException } from '@nestjs/microservices';
import { isEmpty } from 'lodash';
import { z } from 'zod';

const schema = z.object({
  uid: z.number(),
});

@Injectable()
export class RequestContextPayloadGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const rmq = context.switchToRpc().getContext<RmqContext>();
    const msg = rmq.getMessage();

    const headers = msg.properties?.headers;
    if (!headers || !headers['x-correlation-id'] || isEmpty(headers['x-correlation-id'])) {
      throw new RpcException('There is no correlation id');
    }
    const tokenPayload = JSON.parse(String(msg.properties?.headers?.['x-token-payload'] ?? '{}'));
    if (!schema.safeParse(tokenPayload).success) {
      throw new RpcException('There is no uid');
    }

    return true;
  }
}
