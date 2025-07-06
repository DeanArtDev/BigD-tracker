import { dbConfigFactory } from '@/infrastructure/configs';
import { appConfigFactory } from '@/infrastructure/configs/app-config-factory';
import { RmqClientsModule } from '@/infrastructure/rmq-clients';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users';
import { DatabaseModule } from '@big-d/database';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CqrsModule.forRoot(),
    RmqClientsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory],
      envFilePath: ['.env.production', '.env.development'],
    }),
    DatabaseModule.forRootAsync(dbConfigFactory()),

    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
