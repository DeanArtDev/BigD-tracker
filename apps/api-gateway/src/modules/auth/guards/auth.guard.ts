import { ExceptionUnauthorized } from '@/modules/auth/exceptions';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY, PAYLOAD_KEY } from '../decorators';
import { AccessTokenPayload } from '../dto/access-token.dto';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
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
        message: 'Missing authorization token',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      request[PAYLOAD_KEY] = await this.jwtService.verifyAsync<AccessTokenPayload>(token);

      return true;
    } catch {
      throw new ExceptionUnauthorized({ message: 'Invalid or expired access token' });
    }
  }
}
