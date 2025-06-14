import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '@/modules/users/users.module';
import { AuthRepository } from './auth.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { CookieService } from '@shared/services/cookies.service';
import { APP_ENV } from '@/infrastructure/configs';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<APP_ENV>) => {
        return {
          global: true,
          secret: configService.get('AUTH_SECRET_KEY'),
          signOptions: { expiresIn: configService.get('ACCESS_TOKEN_TIME') },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    CookieService,
    AuthService,
    AuthRepository,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
