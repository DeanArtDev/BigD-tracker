import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'ACCOUNT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          name: 'ACCOUNT_SERVICE',
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://devuser:devpassword@localhost:5672'],
            queue: 'account_service_queue',
            queueOptions: { durable: false, autoDelete: true },
            exchange: 'account_service_exchange',
            exchangeType: 'topic',
            wildcards: true,
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RmqClientsModule {}
