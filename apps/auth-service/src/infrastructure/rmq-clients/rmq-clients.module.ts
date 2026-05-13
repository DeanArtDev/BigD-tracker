import { rmqConfig } from '@/infrastructure/configs';
import { AUTH_SERVICE_RMQ_KEY, goalServiceRmqConfig } from '@big-d/api-contracts';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_RMQ_KEY,
        imports: [ConfigModule.forFeature(rmqConfig)],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return goalServiceRmqConfig({
            host: config.get('rmq-client.HOST'),
            port: config.get('rmq-client.PORT'),
            user: config.get('rmq-client.USER'),
            password: config.get('rmq-client.PASSWORD'),
            isProd: config.get('IS_PROD', false),
          });
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RmqClientsModule {}
