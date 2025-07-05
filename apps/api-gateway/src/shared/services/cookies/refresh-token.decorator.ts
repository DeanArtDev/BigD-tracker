import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { REFRESH_TOKEN_FIELD } from './cookies.service';

export const getRefreshTokenCookie = (request: Request) => request.cookies[REFRESH_TOKEN_FIELD];

export const RefreshToken = createParamDecorator((_data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<Request>();
  return req.cookies[REFRESH_TOKEN_FIELD];
});
