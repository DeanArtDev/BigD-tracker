import { TasksModule } from '@/modules/tasks/tasks.module';
import { PostgresDbModule } from '@big-d/database';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { RequestContextInterceptor } from '@shared/request-context';
import { GoalObservabilityModule } from '@shared/observability';
import { appConfigFactory, dbConfigFactory, envSchema } from './infrastructure/configs';
import { RmqClientsModule } from './infrastructure/rmq-clients';

@Module({
  providers: [RequestContextInterceptor],
  imports: [
    ScheduleModule.forRoot(),
    CqrsModule.forRoot(),
    RmqClientsModule,
    PostgresDbModule.forRootAsync(dbConfigFactory()),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfigFactory],
      envFilePath: ['.env.production', '.env.development', '.env.test'],
      validate: (config) => envSchema.parse(config),
    }),
    GoalObservabilityModule,

    TasksModule,
  ],
})
export class AppModule {}
