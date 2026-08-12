import type { TRAINING_APP_ENV } from '@/infrastructure/configs';
import { ObservabilityModule } from '@big-d/observability/nest';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RmqObservabilityInterceptor } from './rmq-observability.interceptor';

@Module({
  imports: [
    ObservabilityModule.forRootAsync<[ConfigService<TRAINING_APP_ENV>]>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config) => {
        const isPretty = config.get('LOG_PRETTY') === '1';

        return {
          service: {
            name: 'training-service',
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
class TrainingObservabilityModule {}

export { TrainingObservabilityModule };
