import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export const IpAddress = createParamDecorator((_data, ctx: ExecutionContext) => {
  /*TODO: FIXME: delete when all endpoints will use apollo client */
  const req =
    ctx.getType<GqlContextType>() === 'graphql'
      ? GqlExecutionContext.create(ctx).getContext<AppGraphQLContext>().request
      : ctx.switchToHttp().getRequest<Request>();
  return req.headers['x-forwarded-for'];
});
