import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { CookieService } from '@shared/services/cookies';
import { Request, Response } from 'express';
import { ACCESS_TOKEN_KEY } from '../constants';
import { getAccessToken, IS_PUBLIC_KEY } from '../decorators';
import { AccessTokenPayload } from '../dto/access-token.dto';
import { ExceptionUnauthorized } from '../exceptions';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cookieService: CookieService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const accessToken = getAccessToken(request);

    if (accessToken == null) {
      this.cookieService.dropTokens(response);
      throw new ExceptionUnauthorized({ message: 'Missing authorization token' });
    }

    try {
      request[ACCESS_TOKEN_KEY] = await this.jwtService.verifyAsync<AccessTokenPayload>(accessToken);

      return true;
    } catch {
      this.cookieService.dropTokens(response);
      throw new ExceptionUnauthorized({ message: 'Invalid or expired access token' });
    }
  }
}
