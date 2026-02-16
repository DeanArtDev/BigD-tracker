import { dbConfigFactory } from '@/infrastructure/configs';
import { appConfigFactory } from '@/infrastructure/configs/app-config-factory';
import { RmqClientsModule } from '@/infrastructure/rmq-clients';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users';
import { ObservabilityModule, LoggerModuleOptions } from '@big-d/api-utils';
import { DatabaseModule } from '@big-d/database';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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

    ObservabilityModule.forRootAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): LoggerModuleOptions => {
        return {
          env: configService.get('NODE_ENV', 'development'),
          level: configService.get('LOG_PRETTY'),
        };
      },
    }),

    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
