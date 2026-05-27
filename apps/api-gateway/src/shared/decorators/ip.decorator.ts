import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const IpAddress = createParamDecorator((_data, ctx: ExecutionContext) => {
  /*TODO: FIXME: delete when all endpoints will use apollo client */
  const req =
    ctx.switchToHttp().getRequest<Request>() ?? GqlExecutionContext.create(ctx).getContext<AppGraphQLContext>().request;
  return req.headers['x-forwarded-for'];
});
