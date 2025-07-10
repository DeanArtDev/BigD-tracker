import { APP_ENV } from '@/infrastructure/configs';
import {
  ACCOUNT_SERVICE_RMQ_KEY,
  accountServiceRmqConfig,
  GOAL_SERVICE_RMQ_KEY,
  goalServiceRmqConfig,
  TRAINING_SERVICE_RMQ_KEY,
  trainingServiceRmqConfig,
} from '@big-d/api-contracts';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: TRAINING_SERVICE_RMQ_KEY,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService<APP_ENV>) =>
          trainingServiceRmqConfig({
            host: config.get('RMQ_HOST'),
            port: config.get('RMQ_PORT'),
            user: config.get('RMQ_USER'),
            password: config.get('RMQ_PASSWORD'),
            isProd: config.get('IS_PROD', false),
          }),
      },

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
    ]),
  ],
  exports: [ClientsModule],
})
export class RmqClientsModule {}
