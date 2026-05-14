import { AuthModule } from '@/modules/auth/auth.module';
import { LoggerModuleOptions, ObservabilityModule } from '@big-d/api-utils';
import { PostgresDbModule } from '@big-d/database';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthServiceRequestContext, RequestContextInterceptor } from '@shared/request-context';
import { appConfigFactory, dbConfigFactory, authConfigSchema } from './infrastructure/configs';
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
      validate: (config) => authConfigSchema.parse(config),
    }),
    ObservabilityModule.forRootAsync({
      global: true,
      requestContext: AuthServiceRequestContext,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): LoggerModuleOptions => {
        return {
          env: configService.get('NODE_ENV', 'production'),
          level: configService.get('LOG_PRETTY'),
        };
      },
    }),

    AuthModule,
  ],
})
export class AppModule {}
