import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfigFactory } from '@shared/configs/app-config-factory';
import { DatabaseModule } from '@shared/modules/db';
import { UsersModule } from '@/users/users.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory],
      envFilePath: ['.env.production', '.env.development'],
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
