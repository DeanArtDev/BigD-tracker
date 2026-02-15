import { APP_ENV } from '@/infrastructure/configs';
import { LoggerModule, RmqLogger } from '@/shared/observability';
import { ACCOUNT_SERVICE_RMQ_KEY, accountServiceRmqConfig } from '@big-d/api-contracts';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxy, ClientsModule } from '@nestjs/microservices';
import { AppRmqClient } from '../app-client-proxy.service';

const TIMEOUT_MS = 5000;

const ACCOUNT_RMQ_SERVICE = Symbol.for('ACCOUNT_RMQ_SERVICE');

@Module({
  imports: [
    LoggerModule,
    ClientsModule.registerAsync({
      clients: [
        {
          name: ACCOUNT_SERVICE_RMQ_KEY,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService<APP_ENV>) =>
            accountServiceRmqConfig({
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
      provide: ACCOUNT_RMQ_SERVICE,
      useFactory: (client: ClientProxy, logger: RmqLogger) => {
        return new AppRmqClient(client, logger, { timeout: TIMEOUT_MS });
      },
      inject: [ACCOUNT_SERVICE_RMQ_KEY, RmqLogger],
    },
  ],

  exports: [ACCOUNT_RMQ_SERVICE],
})
export class AccountServiceClientModule {}
export { ACCOUNT_RMQ_SERVICE };
