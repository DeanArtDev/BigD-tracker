import { APP_ENV } from '@/infrastructure/configs';
import { LoggerModule, RmqLogger } from '@/shared/observability';
import { GOAL_SERVICE_RMQ_KEY, goalServiceRmqConfig } from '@big-d/api-contracts';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxy, ClientsModule } from '@nestjs/microservices';
import { AppRmqClient } from '../app-client-proxy.service';

const TIMEOUT_MS = 5000;

const GOAL_RMQ_SERVICE = Symbol.for('GOAL_RMQ_SERVICE');

@Module({
  imports: [
    LoggerModule,
    ClientsModule.registerAsync({
      clients: [
        {
          name: GOAL_SERVICE_RMQ_KEY,
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService<APP_ENV>) =>
            goalServiceRmqConfig({
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
      provide: GOAL_RMQ_SERVICE,
      useFactory: (client: ClientProxy, logger: RmqLogger) => {
        return new AppRmqClient(client, logger, { timeout: TIMEOUT_MS });
      },
      inject: [GOAL_SERVICE_RMQ_KEY, RmqLogger],
    },
  ],

  exports: [GOAL_RMQ_SERVICE],
})
export class GoalServiceClientModule {}
export { GOAL_RMQ_SERVICE };
