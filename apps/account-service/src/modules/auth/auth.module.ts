import { ACCOUNT_APP_ENV } from '@/infrastructure/configs';
import {
  AUTH_REPOSITORY,
  AuthController,
  AuthService,
  CreateSessionCommand,
  CreateSessionHandler,
  DeleteSessionCommand,
  DeleteSessionHandler,
  GetSessionHandler,
  GetSessionQuery,
  LoginUseCase,
  LogoutUseCase,
  RefreshUseCase,
  RegisterUseCase,
} from '@/modules/auth/application';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SessionCreatedEvent } from './domain';
import { KyselyAuthRepository } from './infra/kysely-auth.repository';

const commands = [CreateSessionCommand, DeleteSessionCommand];
const handlers = [CreateSessionHandler, GetSessionHandler, DeleteSessionHandler];
const events = [SessionCreatedEvent];
const queries = [GetSessionQuery];
const useCases = [RegisterUseCase, RefreshUseCase, LogoutUseCase, LoginUseCase];

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ACCOUNT_APP_ENV>) => {
        return {
          secret: configService.get('AUTH_SECRET_KEY'),
          signOptions: { expiresIn: configService.get('ACCESS_TOKEN_TIME') },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: AUTH_REPOSITORY, useClass: KyselyAuthRepository },
    ...commands,
    ...handlers,
    ...events,
    ...queries,
    ...useCases,
  ],
})
export class AuthModule {}
