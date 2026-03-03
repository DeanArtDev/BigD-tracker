import { AccountServiceClientModule, GoalServiceClientModule } from '@/infrastructure/rmq-clients/clients';
import { RegisterSage } from '@/modules/auth/application';
import { AuthGuard } from './guards/auth.guard';
import { UsersModule } from '@/modules/users/users.module';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { CookieService } from '@shared/services/cookies';
import { AuthController } from './auth.controller';
import { jwtConfigFabrica } from './configs';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync(jwtConfigFabrica()),
    GoalServiceClientModule,
    AccountServiceClientModule,
  ],
  controllers: [AuthController],
  providers: [CookieService, RegisterSage, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthModule {}
