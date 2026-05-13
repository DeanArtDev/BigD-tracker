import { authConfig } from '@/infrastructure/configs';
import { AuthInfrastructureModule } from '@/modules/auth/infrastructure/auth-infrastructure.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SessionTokenService, UserCheckerService, UserPasswordService } from './services';
import { UserRegistrationCommand, UserRegistrationHandler, UserRegistrationUseCase } from './user-cases';

const userRegistration = [UserRegistrationCommand, UserRegistrationHandler, UserRegistrationUseCase];

@Module({
  imports: [
    AuthInfrastructureModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule.forFeature(authConfig)],
      useFactory: (configService: ConfigService) => {
        return {
          privateKey: configService.get('auth.SECRET_KEY'),
          signOptions: {
            issuer: 'auth-service',
            audience: 'api-gateway',
            algorithm: 'RS256',
            expiresIn: configService.get('auth.ACCESS_EXPIRE_TIME'),
          },
        };
      },
    }),
  ],

  providers: [...userRegistration, UserPasswordService, SessionTokenService, UserCheckerService],
})
export class AuthApplicationModule {}
