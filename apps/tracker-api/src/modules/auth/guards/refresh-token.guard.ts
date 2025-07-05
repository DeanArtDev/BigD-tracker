import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getRefreshTokenCookie } from '@shared/services/cookies';
import { Request } from 'express';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const refreshToken = getRefreshTokenCookie(request);

    if (refreshToken == null || refreshToken === '') {
      throw new UnauthorizedException('Refresh token not found');
    }

    return true;
  }
}
