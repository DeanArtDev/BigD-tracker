import { authConfig } from '@/infrastructure/configs';
import { AuthInfrastructureModule } from '@/modules/auth/infrastructure/auth-infrastructure.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GetMeHandler, GetMeQuery } from './queries';
import { SessionService, UserCheckerService, UserPasswordService } from './services';
import {
  UserLoginCommand,
  UserLoginHandler,
  UserLoginUseCase,
  UserRegistrationCommand,
  UserRegistrationHandler,
  UserRegistrationUseCase,
  UserLogoutHandler,
  UserLogoutCommand,
  UserLogoutUseCase,
  UserTokenRefreshUseCase,
  UserTokenRefreshCommand,
  UserTokenRefreshHandler,
  UserDeleteCommand,
  UserDeleteHandler,
  UserDeleteUseCase,
} from './use-cases';

/* USE CASES */
const userRegistration = [UserRegistrationCommand, UserRegistrationHandler, UserRegistrationUseCase];
const userLogin = [UserLoginCommand, UserLoginHandler, UserLoginUseCase];
const userLogout = [UserLogoutHandler, UserLogoutCommand, UserLogoutUseCase];
const userTokenRefresh = [UserTokenRefreshUseCase, UserTokenRefreshCommand, UserTokenRefreshHandler];
const userDelete = [UserDeleteCommand, UserDeleteHandler, UserDeleteUseCase];

/* QUERIES */
const meQuery = [GetMeQuery, GetMeHandler];

@Module({
  imports: [
    AuthInfrastructureModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule.forFeature(authConfig)],
      useFactory: (configService: ConfigService) => {
        return {
          privateKey: configService.get('auth.PRIVATE_AUTH_KEY'),
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

  providers: [
    ...userRegistration,
    ...userLogin,
    ...userLogout,
    ...userTokenRefresh,
    ...userDelete,

    ...meQuery,
    UserPasswordService,
    SessionService,
    UserCheckerService,
  ],
})
export class AuthApplicationModule {}
