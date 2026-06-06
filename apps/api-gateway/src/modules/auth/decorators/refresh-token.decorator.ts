import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

const REFRESH_TOKEN_KEY = 'refresh_token';

const getRefreshTokenCookie = (request: Request) => request.cookies[REFRESH_TOKEN_KEY];

const RefreshToken = createParamDecorator((_data, ctx: ExecutionContext) => {
  const req =
    ctx.getType<GqlContextType>() === 'graphql'
      ? GqlExecutionContext.create(ctx).getContext<AppGraphQLContext>().request
      : ctx.switchToHttp().getRequest<Request>();

  return req?.cookies[REFRESH_TOKEN_KEY];
});

export { REFRESH_TOKEN_KEY, RefreshToken, getRefreshTokenCookie };
