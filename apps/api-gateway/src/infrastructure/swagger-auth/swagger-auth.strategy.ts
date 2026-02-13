import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import { APP_ENV } from '../configs';

@Injectable()
export class SwaggerAuthStrategy extends PassportStrategy(BasicStrategy, 'swagger') {
  constructor(private readonly configService: ConfigService<APP_ENV>) {
    super();
  }
  validate(username: string, password: string): boolean {
    const pas = this.configService.getOrThrow('SWAGGER_PASSWORD');
    const usr = this.configService.getOrThrow('SWAGGER_USER');
    return username === usr && password === pas;
  }
}
