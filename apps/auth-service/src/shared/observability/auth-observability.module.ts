import type { AUTH_APP_ENV } from '@/infrastructure/configs';
import { ObservabilityModule } from '@big-d/observability/nest';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RmqObservabilityInterceptor } from './rmq-observability.interceptor';

@Module({
  imports: [
    ObservabilityModule.forRootAsync<[ConfigService<AUTH_APP_ENV>]>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config) => {
        const isPretty = config.get('LOG_PRETTY') === '1';

        return {
          service: {
            name: 'auth-service',
            version: config.getOrThrow('APP_VERSION'),
            environment: config.getOrThrow('APP_ENV'),
            instanceId: config.get('INSTANCE_ID'),
          },
          level: isPretty ? 'trace' : 'info',
          pretty: isPretty,
        };
      },
    }),
  ],
  providers: [RmqObservabilityInterceptor],
  exports: [RmqObservabilityInterceptor],
})
class AuthObservabilityModule {}

export { AuthObservabilityModule };
