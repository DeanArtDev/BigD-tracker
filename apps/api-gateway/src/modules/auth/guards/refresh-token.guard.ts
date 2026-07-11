import { AppGraphQLContext } from '@/infrastructure/graphql-client/types';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { getRefreshTokenCookie } from '../decorators';
import { ExceptionUnauthorized } from '../exceptions';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request =
      context.getType<GqlContextType>() === 'graphql'
        ? GqlExecutionContext.create(context).getContext<AppGraphQLContext>().request
        : context.switchToHttp().getRequest<Request>();
    const refreshToken = getRefreshTokenCookie(request);

    if (refreshToken == null || refreshToken === '') {
      throw new ExceptionUnauthorized({ message: 'Refresh token not found or invalid' });
    }

    return true;
  }
}
