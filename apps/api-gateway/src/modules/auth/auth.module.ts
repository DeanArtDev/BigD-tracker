import { AuthServiceClientModule, GoalServiceClientModule } from '@/infrastructure/rmq-clients/clients';
import { RegisterSage } from '@/modules/auth/application';
import { AuthResolver } from '@/modules/auth/presentation/graphql/reslovers';
import { UsersModule } from '@/modules/users/users.module';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { CookieService } from '@shared/services/cookies';
import { AuthController } from './auth.controller';
import { jwtConfigFabrica } from './configs';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [UsersModule, JwtModule.registerAsync(jwtConfigFabrica()), GoalServiceClientModule, AuthServiceClientModule],
  controllers: [AuthController],
  providers: [CookieService, RegisterSage, AuthResolver, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthModule {}
