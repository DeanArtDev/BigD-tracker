import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export const UserAgent = createParamDecorator((_data, ctx: ExecutionContext) => {
  const req =
    ctx.getType<GqlContextType>() === 'graphql'
      ? GqlExecutionContext.create(ctx).getContext<AppGraphQLContext>().request
      : ctx.switchToHttp().getRequest<Request>();
  return req.headers['user-agent'];
});
