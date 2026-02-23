import { ExceptionUnauthorized } from '@/modules/auth/exceptions';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { getRefreshTokenCookie } from '@shared/services/cookies';
import { Request } from 'express';

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
