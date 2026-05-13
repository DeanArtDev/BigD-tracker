import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const REFRESH_TOKEN_KEY = 'refresh_token';

const getRefreshTokenCookie = (request: Request) => request.cookies[REFRESH_TOKEN_KEY];

const RefreshToken = createParamDecorator((_data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<Request>();
  return req.cookies[REFRESH_TOKEN_KEY];
});

export { REFRESH_TOKEN_KEY, RefreshToken, getRefreshTokenCookie };
