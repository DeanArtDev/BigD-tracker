import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { TOKEN_PAYLOAD_HEADER_KEY } from '@shared/request-context/constants';
import { getCorrelationId } from './helpers';

interface RequestContextData {
  readonly userId: number;
  readonly correlationId: string;
}

const RequestContext = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): RequestContextData => {
    const rmq = ctx.switchToRpc().getContext<RmqContext>();
    const msg = rmq.getMessage();

    const tokenPayload = JSON.parse(
      String(msg.properties?.headers?.[TOKEN_PAYLOAD_HEADER_KEY] ?? '{}'),
    );

    return {
      userId: tokenPayload?.uid,
      // !NOTE принудительное наличие (!) msg обусловленно RequestContextPayloadGuard на всем контроллере
      correlationId: getCorrelationId(msg)!,
    };
  },
);

export { RequestContext, RequestContextData };
