import { TasksModule } from '@/modules/tasks/tasks.module';
import { LoggerModuleOptions, ObservabilityModule } from '@big-d/api-utils';
import { PostgresDbModule } from '@big-d/database';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { appConfigFactory, dbConfigFactory, envSchema } from './infrastructure/configs';
import { RmqClientsModule } from './infrastructure/rmq-clients';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CqrsModule.forRoot(),
    RmqClientsModule,
    PostgresDbModule.forRootAsync(dbConfigFactory()),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory],
      envFilePath: ['.env.production', '.env.development'],
      validate: (config) => envSchema.parse(config),
    }),

    ObservabilityModule.forRootAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): LoggerModuleOptions => {
        return {
          env: configService.get('NODE_ENV', 'production'),
          level: configService.get('LOG_PRETTY'),
        };
      },
    }),

    TasksModule,
  ],
})
export class AppModule {}
