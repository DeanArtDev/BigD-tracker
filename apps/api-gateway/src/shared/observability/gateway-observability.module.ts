import { APP_ENV } from '@/infrastructure/configs';
import { jwtConfigFabrica } from '@/modules/auth/configs';
import { ObservabilityModule } from '@big-d/observability/nest';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { GraphqlObservabilityInterceptor } from './graphql-observability.interceptor';
import { GraphqlObservabilityPlugin } from './graphql-observability.plugin';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfigFabrica()),
    ObservabilityModule.forRootAsync<[ConfigService<APP_ENV>]>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config) => {
        const isPretty = config.get('LOG_PRETTY') === '1';

        return {
          service: {
            name: 'api-gateway',
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
  providers: [
    GraphqlObservabilityPlugin,
    {
      provide: APP_INTERCEPTOR,
      useClass: GraphqlObservabilityInterceptor,
    },
  ],
})
class GatewayObservabilityModule {}

export { GatewayObservabilityModule };
