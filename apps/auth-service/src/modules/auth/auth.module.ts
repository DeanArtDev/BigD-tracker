import { Module } from '@nestjs/common';
import { AuthApplicationModule } from './application/auth-application.module';
import { AuthPresentationModule } from './presentation/auth-presentation.module';

@Module({
  imports: [AuthPresentationModule, AuthApplicationModule],
})
export class AuthModule {}
