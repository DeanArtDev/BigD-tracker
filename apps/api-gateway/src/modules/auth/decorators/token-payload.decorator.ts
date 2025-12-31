import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { Request } from 'express';

const PAYLOAD_KEY = 'tokenPayload';

function tokenPayloadFactory(_: unknown, ctx: ExecutionContext): AccessTokenPayload | undefined {
  const request = ctx.switchToHttp().getRequest<Request>();
  const payload = getTokenPayloadFromRequest(request);

  if (validateSync(payload).length > 0) {
    return undefined;
  }
  return payload;
}

const TokenPayload = createParamDecorator(tokenPayloadFactory);

function getTokenPayloadFromRequest(request: Request): AccessTokenPayload {
  return plainToInstance(AccessTokenPayload, request[PAYLOAD_KEY], {
    excludeExtraneousValues: true,
  });
}

export { TokenPayload, getTokenPayloadFromRequest, PAYLOAD_KEY };
