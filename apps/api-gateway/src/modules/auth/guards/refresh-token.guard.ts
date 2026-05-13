import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { getRefreshTokenCookie } from '../decorators';
import { ExceptionUnauthorized } from '../exceptions';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const refreshToken = getRefreshTokenCookie(request);

    if (refreshToken == null || refreshToken === '') {
      throw new ExceptionUnauthorized({ message: 'Refresh token not found or invalid' });
    }

    return true;
  }
}
