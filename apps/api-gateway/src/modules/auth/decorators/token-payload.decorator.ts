import { ExceptionAuthInvalidToken } from '@/modules/auth/exceptions';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AccessTokenPayload } from '@/modules/auth/dto/access-token.dto';
import { Request } from 'express';

const PAYLOAD_KEY = 'tokenPayload';

function tokenPayloadFactory(_: unknown, ctx: ExecutionContext): AccessTokenPayload | undefined {
  const request = ctx.switchToHttp().getRequest<Request>();

  return getTokenPayloadFromRequest(request);
}

const TokenPayload = createParamDecorator(tokenPayloadFactory);

function getTokenPayloadFromRequest(request: Request): AccessTokenPayload | undefined {
  const payload = plainToInstance(AccessTokenPayload, request[PAYLOAD_KEY], {
    excludeExtraneousValues: true,
  });

  if (validateSync(payload).length > 0) {
    throw new ExceptionAuthInvalidToken({ message: 'Invalid token', subjectId: payload?.sid ?? payload?.uid });
  }

  return payload;
}

export { TokenPayload, getTokenPayloadFromRequest, PAYLOAD_KEY };
