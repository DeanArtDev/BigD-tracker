import { APP_ENV } from '@/infrastructure/configs';
import { AUTH_SERVICE_RMQ_KEY, authServiceRmqConfig } from '@big-d/api-contracts';
import { RmqLogger } from '@big-d/api-utils';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxy, ClientsModule } from '@nestjs/microservices';
import { AppRmqClient } from '../app-client-proxy.service';

const TIMEOUT_MS = 5000;

const AUTH_RMQ_SERVICE = Symbol.for('AUTH_RMQ_SERVICE');

@Module({
  imports: [
    ClientsModule.registerAsync({
      clients: [
        {
          name: AUTH_SERVICE_RMQ_KEY,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService<APP_ENV>) =>
            authServiceRmqConfig({
              host: config.get('RMQ_HOST'),
              port: config.get('RMQ_PORT'),
              user: config.get('RMQ_USER'),
              password: config.get('RMQ_PASSWORD'),
              isProd: config.get('IS_PROD', false),
            }),
        },
      ],
    }),
  ],

  providers: [
    {
      provide: AUTH_RMQ_SERVICE,
      useFactory: (client: ClientProxy, logger: RmqLogger) => {
        return new AppRmqClient(client, logger, { timeout: TIMEOUT_MS });
      },
      inject: [AUTH_SERVICE_RMQ_KEY, RmqLogger],
    },
  ],

  exports: [AUTH_RMQ_SERVICE],
})
export class AuthServiceClientModule {}
export { AUTH_RMQ_SERVICE };
