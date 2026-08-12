import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { timingSafeEqual } from 'node:crypto';
import { BasicStrategy } from 'passport-http';
import { APP_ENV } from '../configs';

@Injectable()
export class SwaggerAuthStrategy extends PassportStrategy(BasicStrategy, 'swagger') {
  constructor(private readonly configService: ConfigService<APP_ENV>) {
    super();
  }
  validate(username: string, password: string): boolean {
    const expectedPassword = this.configService.getOrThrow<string>('SWAGGER_PASSWORD');
    const expectedUsername = this.configService.getOrThrow<string>('SWAGGER_USER');

    return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
  }
}

function safeEqual(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}
