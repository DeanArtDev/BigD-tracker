import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const UserAgent = createParamDecorator((_data, ctx: ExecutionContext) => {
  const req =
    ctx.switchToHttp().getRequest<Request>() ?? GqlExecutionContext.create(ctx).getContext<AppGraphQLContext>().request;
  return req.headers['user-agent'];
});
