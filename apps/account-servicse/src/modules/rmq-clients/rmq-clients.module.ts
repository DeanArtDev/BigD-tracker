import { ACCOUNT_APP_ENV } from '@/infrastructure/configs';
import { accountServiceRmqConfig } from '@big-d/api-contracts';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';

const ACCOUNT_SERVICE_RMQ_KEY = Symbol('ACCOUNT_SERVICE');

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: ACCOUNT_SERVICE_RMQ_KEY,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService<ACCOUNT_APP_ENV>) => {
          return accountServiceRmqConfig({
            host: config.get('RMQ_HOST'),
            port: config.get('RMQ_PORT'),
            user: config.get('RMQ_USER'),
            password: config.get('RMQ_PASSWORD'),
            isProd: config.get('IS_PROD', false),
          });
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
class RmqClientsModule {}

export { RmqClientsModule, ACCOUNT_SERVICE_RMQ_KEY };
