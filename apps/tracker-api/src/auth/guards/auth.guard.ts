import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { APP_ENV } from '@shared/configs';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators';
import { PAYLOAD_KEY } from '../decorators';
import { ExceptionUnauthorized } from '@big-d/api-exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService<APP_ENV>,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ExceptionUnauthorized({
        message: 'Missing or invalid Authorization token',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      request[PAYLOAD_KEY] = await this.jwtService.verifyAsync<{ userId: number }>(
        token,
        this.configService.get('AUTH_SECRET_KEY'),
      );

      return true;
    } catch {
      throw new ExceptionUnauthorized({ message: 'Invalid or expired access token' });
    }
  }
}
