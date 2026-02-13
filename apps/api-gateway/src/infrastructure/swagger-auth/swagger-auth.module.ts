import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SwaggerAuthStrategy } from './swagger-auth.strategy';

@Module({
  imports: [PassportModule],
  providers: [SwaggerAuthStrategy],
})
export class SwaggerAuthModule {}
